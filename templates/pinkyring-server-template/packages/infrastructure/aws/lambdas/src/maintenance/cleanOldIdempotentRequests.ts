import container from '@pinkyring-server-template/di-container/container';

const service = container.resolveMaintenanceService();
const principal = container
  .resolvePrincipalResolver()
  .resolveMachinePrincipal('AWS Clean Old Idempotent Requests Handler');

/** lambda handler function */
export const handler = async () => {
  await service.cleanOldIdempotentRequests(principal);
};
