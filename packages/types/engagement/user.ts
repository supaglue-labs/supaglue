import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysEngagementUser = SnakecasedKeys<User>;
export type SnakecasedKeysEngagementSimpleUser = SnakecasedKeys<SimpleUser>;
export type SnakecasedKeysEngagementSimpleUserWithTenant = SnakecasedKeysEngagementSimpleUser & {
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

export type SimpleUser = BaseUser & {
  lastModifiedAt: Date;
  rawData: Record<string, any>;
};

export type RemoteUser = BaseUser &
  BaseEngagementModelRemoteOnlyParams & {
    rawData: Record<string, any>;
  };

export type RemoteUserTypes = {
  object: RemoteUser;
  createParams: never;
  updateParams: never;
};
