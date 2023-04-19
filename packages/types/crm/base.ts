export type BaseCrmModel = {
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;

  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;

  lastModifiedAt: Date;
};
