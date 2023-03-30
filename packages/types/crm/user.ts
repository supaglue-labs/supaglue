type BaseUser = {
  remoteId: string;
  name: string | null;
  email: string | null;
  isActive: boolean | null;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type User = BaseUser & {
  id: string;
  lastModifiedAt: Date | null;
};

export type RemoteUser = BaseUser & {
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};
