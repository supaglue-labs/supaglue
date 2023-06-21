import { BaseEngagementModel, SnakecasedEngagementTenantFields } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysEngagementUser = SnakecasedKeys<User>;
export type SnakecasedKeysEngagementUserWithTenant = SnakecasedKeysEngagementUser & SnakecasedEngagementTenantFields;

type CoreUser = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type User = BaseEngagementModel & CoreUser;

export type RemoteUserTypes = {
  object: User;
  createParams: never;
  updateParams: never;
};
