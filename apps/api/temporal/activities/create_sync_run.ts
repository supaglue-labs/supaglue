import { getDependencyContainer } from '../../dependency_container';
import { SyncRun } from '../../syncs/entities';

type CreateSyncRunArgs = {
  syncId: string;
};

export async function createSyncRun({ syncId }: CreateSyncRunArgs): Promise<SyncRun> {
  const { syncService } = getDependencyContainer();
  return await syncService.createSyncRun(syncId);
}
