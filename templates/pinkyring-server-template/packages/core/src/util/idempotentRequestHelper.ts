import Principal from '../interfaces/IPrincipal';
import IIdempotentRequestRepository from '../interfaces/IIdempotentRequestRepository';
import BaseClass, {IBaseParams} from './baseClass';

const CONFIGKEYNAME_IDEMPOTENT_REQUESTS_CLEAN_OLDERTHAN_HOURS =
  'IDEMPOTENT_REQUESTS_CLEAN_OLDERTHAN_HOURS';
const CONFIGKEYNAME_IDEMPOTENT_REQUESTS_TIMEDOUT_SECONDS =
  'IDEMPOTENT_REQUESTS_TIMEDOUT_SECONDS';

/** Class to help make idempotent requests */
export default class IdempotentRequestHelper extends BaseClass {
  private _idempotentRequestRepository;
  constructor(
    baseParams: IBaseParams,
    idempotentRequestRepository: IIdempotentRequestRepository
  ) {
    super(baseParams, 'IdempotentRequestHelper', [
      {
        name: CONFIGKEYNAME_IDEMPOTENT_REQUESTS_CLEAN_OLDERTHAN_HOURS,
      },
      {
        name: CONFIGKEYNAME_IDEMPOTENT_REQUESTS_TIMEDOUT_SECONDS,
      },
    ]);
    this._idempotentRequestRepository = idempotentRequestRepository;
  }

  /**
   * Handles making the request idempotent.
   * It will make the request once and then return the same result for every subsequent duplicate request.
   * If there is an issue in the original request, it will treat the next duplicate request as an original.
   * If another duplicate request is made before the first original request can complete, it will wait till the first request completes and then return the same result as the original request.
   * @param principal the current security principal
   * @param originatingClassName the name of the class that is making the idempotent request
   * @param originatingMethodName the name of the method that is making the idempotent request
   * @param requestId the id of the request as specified by the client
   * @param requestFunc the function that should only be called once
   * @returns the result of the idempotent function
   */
  async handleIdempotentRequest<T>(
    principal: Principal,
    originatingClassName: string,
    originatingMethodName: string,
    requestId: string,
    requestFunc: () => Promise<T>
  ): Promise<T> {
    const specificRequestId = this.specifyRequestId(
      principal,
      originatingClassName,
      originatingMethodName,
      requestId
    );

    this._logger.debug(`trying to create request`);
    const requestCreated =
      await this._idempotentRequestRepository.createRequest(specificRequestId);

    if (requestCreated) {
      this._logger.debug(`request created`);

      let result;
      try {
        this._logger.debug(`calling the request function`);
        result = await requestFunc();
      } catch (e) {
        // something failed in the request handler
        // so delete the request record so the same request can be made again
        this._logger.debug(`the request function failed with e: ${e}`);
        this._logger.debug(
          `deleting the request record and then throwing the error`
        );

        await this._idempotentRequestRepository.deleteRequest(
          specificRequestId
        );
        throw e;
      }

      this._logger.debug(`the request function succeeded so saving the result`);
      await this._idempotentRequestRepository.saveRequestResult(
        specificRequestId,
        JSON.stringify(result)
      );
      return result;
    } else {
      // the request has already been made
      // so wait for the request to complete and return the result
      this._logger.debug(`the request already exists`);
      return this.waitForIdempotentRequestToComplete(
        principal,
        originatingClassName,
        originatingMethodName,
        requestId,
        requestFunc,
        10000
      );
    }
  }

  private async waitForIdempotentRequestToComplete<T>(
    principal: Principal,
    originatingClassName: string,
    originatingMethodName: string,
    requestId: string,
    requestFunc: () => Promise<T>,
    maxWaitCountMs: number
  ): Promise<T> {
    const specificRequestId = this.specifyRequestId(
      principal,
      originatingClassName,
      originatingMethodName,
      requestId
    );

    this._logger.debug(`deleting the original request if it timed out`);
    await this._idempotentRequestRepository.deleteRequestIfTimedOut(
      specificRequestId,
      this.getRequestTimedOutSecondsConfigValue()
    );

    this._logger.debug(`checking for the original request result`);
    const result = await this._idempotentRequestRepository.getRequestResult(
      specificRequestId
    );
    if (result) {
      this._logger.debug(
        `the original request result was found so returning result`
      );
      return JSON.parse(result) as T;
    }
    if (result === undefined) {
      // something happened to the original request
      // so we need to make the request again
      this._logger.debug(
        `the original request had an issue so making the request again`
      );
      return this.handleIdempotentRequest(
        principal,
        originatingClassName,
        originatingMethodName,
        requestId,
        requestFunc
      );
    }
    if (result === null) {
      // the original request hasn't finished
      // so wait and check again
      this._logger.debug(
        `the original request hasn't completed so waiting before checking on the result again`
      );

      if (maxWaitCountMs < 0) {
        this._logger.debug(
          `the max wait time has elapsed so going to throw an error`
        );
        throw Error(
          `Request timeout - the max amount of time to wait for the request to complete has elapsed.`
        );
      }

      return await this.snooze(() => {
        return this.waitForIdempotentRequestToComplete(
          principal,
          originatingClassName,
          originatingMethodName,
          requestId,
          requestFunc,
          maxWaitCountMs - 300
        );
      }, 300);
    }
    throw new Error(`Unknown state - The request couldn't be found.`);
  }

  private getRequestTimedOutSecondsConfigValue() {
    const configValueDefault = 300; // 5 minutes...because this should be configured...
    const configValue = Number(
      this.getConfigValue(CONFIGKEYNAME_IDEMPOTENT_REQUESTS_TIMEDOUT_SECONDS)
    );
    return configValue != 0 ? configValue : configValueDefault;
  }

  private snooze<T>(callback: () => Promise<T>, snoozeMs: number) {
    return new Promise<T>(function (resolve) {
      setTimeout(function () {
        resolve(callback());
      }, snoozeMs);
    });
  }

  /**
   * Makes a specific id based on the principal, class, method, and request.
   * @param principal the current security principal
   * @param originatingClassName the name of the class that is making the idempotent request
   * @param originatingMethodName the name of the method that is making the idempotent request
   * @param requestId the id of the request as specified by the client
   * @returns
   */
  specifyRequestId(
    principal: Principal,
    originatingClassName: string,
    originatingMethodName: string,
    requestId: string
  ) {
    return `${principal.identity.id}.${originatingClassName}.${originatingMethodName}.${requestId}`;
  }

  /** Maintenance function to remove old idempotent requests. */
  async cleanOldIdempotentRequests() {
    const hours = this.getConfigValue(
      CONFIGKEYNAME_IDEMPOTENT_REQUESTS_CLEAN_OLDERTHAN_HOURS
    );
    await this._idempotentRequestRepository.deleteRequestsOlderThan(
      Number(hours)
    );
  }
}
