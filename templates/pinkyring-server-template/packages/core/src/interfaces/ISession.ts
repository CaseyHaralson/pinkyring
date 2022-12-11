import Principal from './IPrincipal';

export default interface ISessionHandler {
  newSessionIfNotExists<T>(
    principal: Principal,
    func: () => Promise<T>
  ): Promise<T>;
  getSessionData(): SessionData;
}

/** Data that can be loaded into the session and retrieved later in the session */
export interface SessionData {
  sessionId: string;
  principal: Principal;
}
