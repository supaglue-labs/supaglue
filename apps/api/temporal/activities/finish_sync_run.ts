import { getDependencyContainer } from '../../dependency_container';
import { SyncRun } from '../../syncs/entities';

type FinishSyncRunArgs = {
  syncRunId: string;
  errorMessage?: string;
};

export async function finishSyncRun({ syncRunId, errorMessage }: FinishSyncRunArgs): Promise<SyncRun> {
  const { syncService } = getDependencyContainer();

  return await syncService.finishSyncRun(syncRunId, errorMessage);
}
