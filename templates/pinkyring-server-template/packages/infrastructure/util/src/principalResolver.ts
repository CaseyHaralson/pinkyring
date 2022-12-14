import Principal from '@pinkyring-server-template/core/interfaces/IPrincipal';
import {v4 as uuidv4} from 'uuid';
import BaseClass, {
  IBaseParams,
} from '@pinkyring-server-template/core/util/baseClass';

/**
 * Resolves security principals based on the information defined in the resolve function.
 */
export default class PrincipalResolver extends BaseClass {
  constructor(baseParams: IBaseParams) {
    super(baseParams, 'PrincipalResolver');
  }

  /**
   * Define the information necessary to resolve security principals here.
   * The apps that use this resolver can pass in the needed information in return for the security principal.
   */
  resolve() {
    return {
      identity: {
        id: 'some_identity_id',
        name: 'some_identity_name',
      },
      roles: [
        {
          id: 'generic_role_id',
          name: 'generic_role',
        },
      ],
    } as Principal;
  }

  /**
   * Resolves a machine security principal.
   * Define the information needed to resolve that sort of security principal here.
   * @param machineName
   * @returns
   */
  resolveMachinePrincipal(machineName: string) {
    return {
      identity: {
        id: uuidv4(),
        name: machineName,
      },
      roles: [
        {
          id: 'some_machine_role_id',
          name: 'machine_role',
        },
      ],
    } as Principal;
  }
}
