import BaseClass from '@pinkyring-server-template/core/util/baseClass';
import {IBaseParams} from '@pinkyring-server-template/core/util/baseClass';
import {PrismaClient} from '@prisma/client';

/** Integration test helper class to expose functionality that shouldn't be generally available */
export default class IntegrationTestHelperDbRepository extends BaseClass {
  private _prismaClient;
  constructor(baseParams: IBaseParams, prismaClient: PrismaClient) {
    super(baseParams, 'IntegrationTestHelperRepository');
    this._prismaClient = prismaClient;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await this._prismaClient.blogPost.delete({
      where: {
        id: id,
      },
    });
  }

  async deleteAuthor(id: string): Promise<void> {
    await this._prismaClient.author.delete({
      where: {
        id: id,
      },
    });
  }
}
