type BaseUser = {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type User = BaseUser & {
  id: string;
  remoteId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  wasDeleted: boolean;
};

export type RemoteUser = BaseUser & {
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};
