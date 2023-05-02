export type BaseEngagementModel = {
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type BaseEngagementModelNonRemoteParams = {
  id: string;
  lastModifiedAt: Date;
};

export type BaseEngagementModelRemoteOnlyParams = {
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};
