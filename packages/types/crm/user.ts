import { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysUser = SnakecasedKeys<User>;

export type SnakecasedKeysUserWithTenant = SnakecasedKeysUser & {
  provider_name: string;
  customer_id: string;
};

type BaseUser = BaseCrmModel & {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type User = BaseUser &
  BaseCrmModelNonRemoteParams & {
    rawData?: Record<string, any>;
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
