import { BaseEngagementModelV2, SnakecasedEngagementTenantFields } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysEngagementUserV2 = SnakecasedKeys<UserV2>;
export type SnakecasedKeysEngagementUserV2WithTenant = SnakecasedKeysEngagementUserV2 &
  SnakecasedEngagementTenantFields;

type CoreUser = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type UserV2 = BaseEngagementModelV2 & CoreUser;

export type RemoteUserTypes = {
  object: UserV2;
  createParams: never;
  updateParams: never;
};
