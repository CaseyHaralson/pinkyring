import Principal from '@pinkyring-server-template/core/interfaces/IPrincipal';
import ISessionHandler, {
  SessionData,
} from '@pinkyring-server-template/core/interfaces/ISession';
import {createNamespace, getNamespace, Namespace} from 'cls-hooked';
import {v4 as uuidv4} from 'uuid';

const NAMESPACE_NAME = 'pinkyring-server-template.session';
const SESSION_DATA = 'session.data';

/** Session handler using cls-hooked */
// can't extend the BaseClass because one of the the base class parameters needs this as a parameter
export default class SessionHandler implements ISessionHandler {
  newSessionIfNotExists<T>(
    principal: Principal,
    func: () => Promise<T>
  ): Promise<T> {
    const namespace = this.createNamespaceIfNotExists();
    if (this.sessionExists(namespace)) {
      return func();
    } else {
      return namespace.runPromise(async () => {
        namespace.set(SESSION_DATA, {
          sessionId: uuidv4(),
          principal: principal,
        } as SessionData);

        return await func();
      });
    }
  }

  private createNamespaceIfNotExists() {
    let namespace = getNamespace(NAMESPACE_NAME);
    if (namespace === undefined) {
      namespace = createNamespace(NAMESPACE_NAME);
    }
    return namespace;
  }

  private sessionExists(namespace: Namespace) {
    const data = namespace.get(SESSION_DATA);
    if (data !== undefined) return true;
    return false;
  }

  getSessionData(): SessionData {
    const namespace = getNamespace(NAMESPACE_NAME);
    return namespace?.get(SESSION_DATA) as SessionData;
  }
}
