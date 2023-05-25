export type BaseEngagementModel = {
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type BaseEngagementModelV2 = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isDeleted: boolean;
  lastModifiedAt: Date;
  rawData: Record<string, any>;
};

export type BaseEngagementModelNonRemoteParams = {
  id: string;
  lastModifiedAt: Date;
};

export type BaseEngagementModelRemoteOnlyParams = {
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};
