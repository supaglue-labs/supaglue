import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysEngagementUser = SnakecasedKeys<User>;

export type SnakecasedKeysEngagementUserWithTenant = SnakecasedKeysEngagementUser & {
  provider_name: string;
  customer_id: string;
};

type BaseUser = BaseEngagementModel & {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type User = BaseUser &
  BaseEngagementModelNonRemoteParams & {
    rawData?: Record<string, any>;
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
