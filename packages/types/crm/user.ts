import type { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams } from '.';
import type { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysCrmUser = SnakecasedKeys<User>;
export type SnakecasedKeysCrmSimpleUser = SnakecasedKeys<SimpleUser>;
export type SnakecasedKeysCrmSimpleUserWithTenant = SnakecasedKeysCrmSimpleUser & {
  provider_name: string;
  customer_id: string;
};

type BaseUser = BaseCrmModel & {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type User = BaseUser &
  BaseCrmModelNonRemoteParams & {
    rawData?: Record<string, any>;
  };

export type SimpleUser = BaseUser & {
  lastModifiedAt: Date;
  rawData: Record<string, any>;
};

export type RemoteUser = BaseUser &
  BaseCrmModelRemoteOnlyParams & {
    rawData: Record<string, any>;
  };

export type RemoteUserTypes = {
  object: RemoteUser;
  createParams: never;
  updateParams: never;
};
