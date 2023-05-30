import { BaseEngagementModel, BaseEngagementModelV2, SnakecasedEngagementTenantFields } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysEngagementUser = SnakecasedKeys<User>;
export type SnakecasedKeysEngagementUserV2 = SnakecasedKeys<UserV2>;
export type SnakecasedKeysEngagementUserV2WithTenant = SnakecasedKeysEngagementUserV2 &
  SnakecasedEngagementTenantFields;

type CoreUser = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type User = BaseEngagementModel & CoreUser;

export type UserV2 = BaseEngagementModelV2 & CoreUser;

export type RemoteUserTypes = {
  object: UserV2;
  createParams: never;
  updateParams: never;
};
