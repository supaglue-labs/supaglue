export type SyncStatus = 'SYNCING' | 'DONE';

export type SyncInfo = {
  modelName: string;
  lastSyncStart: Date | null;
  nextSyncStart: Date | null;
  status: SyncStatus | null;
  // isInitialSync: boolean;
  applicationId: string;
  // External Id
  customerId: string;
  providerName: string;
  category: 'crm' | 'engagement'; // TODO: centralize
  connectionId: string;
};

export type SyncInfoFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
};
