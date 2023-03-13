type BaseUser = {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type User = BaseUser & {
  id: string;
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

type BaseUserCreateParams = {
  name?: string | null;
  email?: string | null;
  isActive?: boolean | null;
};

export type UserCreateParams = BaseUserCreateParams;
export type RemoteUserCreateParams = BaseUserCreateParams;

export type UserUpdateParams = UserCreateParams & {
  id: string;
};

export type RemoteUserUpdateParams = RemoteUserCreateParams & {
  remoteId: string;
};
