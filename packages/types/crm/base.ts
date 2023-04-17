export type BaseCrmModel = {
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type BaseCrmModelNonRemoteParams = {
  id: string;
  lastModifiedAt: Date;
};

export type BaseCrmModelRemoteOnlyParams = {
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};
