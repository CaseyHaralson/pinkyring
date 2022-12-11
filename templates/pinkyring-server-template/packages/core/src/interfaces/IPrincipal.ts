/**
 * Security is specific to each company and use case
 * so this is just a sketched in security principal
 * that can be changed to your situation.
 */
export default interface Principal {
  identity: Identity;
  roles: Role[];
}

export interface Identity {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}
