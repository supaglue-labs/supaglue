export type SyncStatus = 'SYNCING' | 'DONE';

export type SyncInfo = {
  modelName: string;
  lastSyncStart: Date | null;
  nextSyncStart: Date | null;
  status: SyncStatus | null;
  // isInitialSync: boolean;
  customerId: string;
  providerName: string;
  category: string;
  connectionId: string;
};

export type SyncInfoFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
};
