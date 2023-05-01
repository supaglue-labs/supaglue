/* eslint-disable no-console */
import { getDependencyContainer } from '@/dependency_container';

const { connectionAndSyncService } = getDependencyContainer();

(async () => {
  const result = await connectionAndSyncService.manuallyFixTemporalSyncs();
  console.log(result);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
