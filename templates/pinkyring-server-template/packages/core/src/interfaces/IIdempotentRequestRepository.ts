export default interface IIdempotentRequestRepository {
  createRequest(requestId: string): Promise<boolean>;
  deleteRequestIfTimedOut(
    requestId: string,
    timeoutSeconds: number
  ): Promise<void>;
  saveRequestResult(requestId: string, result: string): Promise<void>;
  getRequestResult(requestId: string): Promise<string | null | undefined>;
  deleteRequest(requestId: string): Promise<void>;
  deleteRequestsOlderThan(hours: number): Promise<void>;
}
