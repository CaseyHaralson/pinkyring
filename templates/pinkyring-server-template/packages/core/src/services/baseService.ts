import Principal from '../interfaces/IPrincipal';
import {ConfigKey} from '../interfaces/IConfig';
import BaseClass, {IBaseParams} from '../util/baseClass';
// .pinkyring=EVENT_SYSTEM
import {BaseEvent} from '../dtos/events';
import EventHelper from '../util/eventHelper';
// .pinkyring=EVENT_SYSTEM.end
import IdempotentRequestHelper from '../util/idempotentRequestHelper';
import ISessionHandler from '../interfaces/ISession';

export interface IBaseServiceParams extends IBaseParams {
  idempotentRequestHelper: IdempotentRequestHelper;
  // .pinkyring=EVENT_SYSTEM
  eventHelper: EventHelper;
  // .pinkyring=EVENT_SYSTEM.end
  sessionHandler: ISessionHandler;
}

/**
 * The base service for all service classes.
 * Adds several helpful functions and wraps some object calls so the extending services don't have to think about it.
 */
export default abstract class BaseService extends BaseClass {
  protected _baseServiceParams;
  /**
   *
   * @param baseServiceParams base service params
   * @param className the name of the class that is extending the BaseService
   * @param configKeys they keys for any configurations that will be needed
   */
  constructor(
    baseServiceParams: IBaseServiceParams,
    className: string,
    configKeys?: ConfigKey[]
  ) {
    super(baseServiceParams, className, configKeys);
    this._baseServiceParams = baseServiceParams;
  }

  /**
   * Wraps every proceeding function call into the same session.
   * This should be the first thing called in a public service function and should wrap the rest of that function's logic.
   *
   * @param principal the current principal
   * @param func the main function that needs to be run
   * @returns returns the func result
   */
  protected async session<T>(
    principal: Principal,
    func: () => Promise<T>
  ): Promise<T> {
    return this._baseServiceParams.sessionHandler.newSessionIfNotExists(
      principal,
      func
    );
  }

  /**
   * Makes the request idempotent.
   * Returns the same response as the original for each subsequent duplicate request.
   * @param principal the current security principal
   * @param methodName the name of the method that is making the idempotent request
   * @param requestId the id of the request as specified by the client
   * @param requestFunc the function that should only be called once
   * @returns the result of the idempotent function
   */
  protected async idempotentRequest<T>(
    principal: Principal,
    methodName: string,
    requestId: string,
    requestFunc: () => Promise<T>
  ): Promise<T> {
    return this._baseServiceParams.idempotentRequestHelper.handleIdempotentRequest(
      principal,
      this.className(),
      methodName,
      requestId,
      requestFunc
    );
  }

  // .pinkyring=EVENT_SYSTEM
  /**
   * Publishes an event to the underlying event system.
   * @param event the event to publish
   * @returns a boolean indicating if the publish was successful
   */
  protected async publishEvent(event: BaseEvent): Promise<boolean> {
    return await this._baseServiceParams.eventHelper.publishEvent(event);
  }
  // .pinkyring=EVENT_SYSTEM.end
}
