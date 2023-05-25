import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelV2 } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysEngagementUser = SnakecasedKeys<User>;
export type SnakecasedKeysEngagementUserV2 = SnakecasedKeys<UserV2>;
export type SnakecasedKeysEngagementUserV2WithTenant = SnakecasedKeysEngagementUserV2 & {
  provider_name: string;
  customer_id: string;
};

type BaseUser = BaseEngagementModel & {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type User = BaseUser &
  BaseEngagementModelNonRemoteParams & {
    rawData?: Record<string, any>;
  };

export type RemoteUser = BaseEngagementModelV2 & {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  rawData: Record<string, any>;
};

export type UserV2 = RemoteUser;

export type RemoteUserTypes = {
  object: RemoteUser;
  createParams: never;
  updateParams: never;
};
