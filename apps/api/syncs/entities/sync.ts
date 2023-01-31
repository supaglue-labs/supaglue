export type Sync = {
  id: string;
  customerId: string;
  enabled: boolean;
  syncConfigName: string;
  fieldMapping?: Record<string, string>;
  salesforceAPIUsageLimitPercentage?: number; // e.g. 0.8
};

export type SyncCreateParams = Omit<Sync, 'id'>;

export type SyncUpdateParams = {
  enabled?: boolean;
  fieldMapping?: Record<string, string>;
  salesforceAPIUsageLimitPercentage?: number; // e.g. 0.8
};
