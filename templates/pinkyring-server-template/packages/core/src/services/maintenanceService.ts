import Principal from '../interfaces/IPrincipal';
import BaseService, {IBaseServiceParams} from './baseService';

/** Exposes maintenance functions for the project. */
export default class MaintenanceService extends BaseService {
  constructor(baseServiceParams: IBaseServiceParams) {
    super(baseServiceParams, 'MaintenanceService');
  }

  /**
   * Maintenance function to remove old idempotent requests.
   * @param principal the current security principal
   */
  async cleanOldIdempotentRequests(principal: Principal) {
    await this.session(principal, async () => {
      this._logger.info('entering the clean old idempotent requests function');
      await this._baseServiceParams.idempotentRequestHelper.cleanOldIdempotentRequests();
    });
  }
}
