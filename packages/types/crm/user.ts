import type { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelV2 } from '.';
import type { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysCrmUser = SnakecasedKeys<User>;
export type SnakecasedKeysCrmUserV2 = SnakecasedKeys<UserV2>;
export type SnakecasedKeysCrmUserV2WithTenant = SnakecasedKeysCrmUserV2 & {
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

export type RemoteUser = BaseCrmModelV2 & {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type UserV2 = RemoteUser;

export type RemoteUserTypes = {
  object: RemoteUser;
  createParams: never;
  updateParams: never;
};
