export type Sync = {
  id: string;
  customerId: string;
  enabled: boolean;
  syncConfigName: string;
  fieldMapping?: Record<string, string>;
  salesforceAPIUsageLimitPercentage?: number; // e.g. 0.8
  lastSyncedTimestamp?: Date; // max updatedAt of all records pulled
};

export type SyncCreateParams = Omit<Sync, 'id'>;

export type SyncUpdateParams = {
  enabled?: boolean;
  fieldMapping?: Record<string, string>;
  salesforceAPIUsageLimitPercentage?: number; // e.g. 0.8
  lastSyncedTimestamp?: Date;
};
