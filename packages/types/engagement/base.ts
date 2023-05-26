export type SnakecasedEngagementTenantFields = {
  provider_name: string;
  customer_id: string;
};

export type BaseEngagementModel = {
  id: string;
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
  lastModifiedAt: Date;
  rawData?: Record<string, any>;
};

export type BaseEngagementModelV2 = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isDeleted: boolean;
  lastModifiedAt: Date;
  rawData: Record<string, any>;
};

export type BaseEngagementModelRemoteOnlyParams = {
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};
