import { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysUser = SnakecasedKeys<User>;
export type SnakecasedKeysSimpleUser = SnakecasedKeys<SimpleUser>;
export type SnakecasedKeysSimpleUserWithTenant = SnakecasedKeysSimpleUser & {
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
