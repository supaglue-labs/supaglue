import { getDependencyContainer } from '../../dependency_container';

type PauseSyncArgs = {
  syncId: string;
  note?: string;
};

export async function pauseSync({ syncId, note }: PauseSyncArgs): Promise<void> {
  const { syncService } = getDependencyContainer();
  await syncService.pauseSync(syncId, note);
}
