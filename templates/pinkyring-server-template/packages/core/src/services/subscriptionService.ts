import Principal from '../interfaces/IPrincipal';
import BaseService, {IBaseServiceParams} from './baseService';

/** Mock subscription service */
export default class SubscriptionService extends BaseService {
  constructor(baseServiceParams: IBaseServiceParams) {
    super(baseServiceParams, 'SubscriptionService');
  }

  /** Mock notify subscribers function */
  notifySubscribersOfNewBlogPost(
    principal: Principal,
    authorId: string,
    blogPostId: string
  ) {
    this.session(principal, () => {
      this._logger.info('In the core subscription service');
      this._logger.info(
        'entering the notify subscribers of new blog post function'
      );
      this._logger.info(`mock: go get subscribers of the author`);
      this._logger.info(
        'mock: generate notification objects and send it to whatever handles notifications'
      );
      this._logger.info(
        `mock: blog post ${blogPostId} was created by author ${authorId}`
      );
      return Promise.resolve();
    });
  }
}
