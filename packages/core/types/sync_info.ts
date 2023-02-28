export type SyncStatus = 'SYNCING' | 'DONE';

export type SyncInfo = {
  modelName: string;
  // modelId: string;
  lastSyncStart: Date | null;
  nextSyncStart: Date | null;
  status: SyncStatus | null;
  // isInitialSync: boolean;
};
