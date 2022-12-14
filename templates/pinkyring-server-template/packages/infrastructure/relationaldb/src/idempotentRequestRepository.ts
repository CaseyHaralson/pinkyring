import {PrismaClient} from '@prisma/client';
import IIdempotentRequestRepository from '@pinkyring-server-template/core/interfaces/IIdempotentRequestRepository';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';
import BaseClass, {
  IBaseParams,
} from '@pinkyring-server-template/core/util/baseClass';
import {ERROR_CODE} from './util/prismaErrors';

/** Idempotent request repository using prisma */
export default class IdempotentRequestRepository
  extends BaseClass
  implements IIdempotentRequestRepository
{
  private _prismaClient;
  constructor(baseParams: IBaseParams, prismaClient: PrismaClient) {
    super(baseParams, 'IdempotentRequestRepository');
    this._prismaClient = prismaClient;
  }

  async createRequest(requestId: string): Promise<boolean> {
    try {
      await this._prismaClient.idempotentRequest.create({
        data: {
          id: requestId,
        },
      });
      return true;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        // don't throw an error here
        // because we know duplicate requests can come in
        // and the database constraints are such to MAKE SURE
        // that the request can only be made once
        // so, return false because this isn't the first request
        if (e.code === ERROR_CODE.UNIQUE_CONSTRAINT) return false;
      }
      throw e;
    }
  }

  async deleteRequestIfTimedOut(
    requestId: string,
    timeoutSeconds: number
  ): Promise<void> {
    const pointInTime = new Date();
    pointInTime.setSeconds(pointInTime.getSeconds() - timeoutSeconds);

    await this._prismaClient.idempotentRequest.deleteMany({
      where: {
        id: requestId,
        createdAt: {
          lt: pointInTime,
        },
        result: null,
      },
    });
  }

  async saveRequestResult(requestId: string, result: string): Promise<void> {
    await this._prismaClient.idempotentRequest.update({
      where: {
        id: requestId,
      },
      data: {
        result: result,
      },
    });
  }

  async getRequestResult(
    requestId: string
  ): Promise<string | null | undefined> {
    const result = await this._prismaClient.idempotentRequest.findFirst({
      where: {
        id: requestId,
      },
    });
    return result ? result.result : undefined;
  }

  async deleteRequest(requestId: string): Promise<void> {
    await this._prismaClient.idempotentRequest.delete({
      where: {
        id: requestId,
      },
    });
  }

  async deleteRequestsOlderThan(hours: number): Promise<void> {
    const pointInTime = new Date();
    pointInTime.setHours(pointInTime.getHours() - hours);

    await this._prismaClient.idempotentRequest.deleteMany({
      where: {
        createdAt: {
          lt: pointInTime,
        },
      },
    });
  }
}
