import type { BaseCrmModelV2, SnakecasedCrmTenantFields } from '.';
import type { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysCrmUserV2 = SnakecasedKeys<UserV2>;
export type SnakecasedKeysCrmUserV2WithTenant = SnakecasedKeysCrmUserV2 & SnakecasedCrmTenantFields;

type CoreUser = {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type UserV2 = BaseCrmModelV2 & CoreUser;

export type RemoteUserTypes = {
  object: UserV2;
  createParams: never;
  updateParams: never;
};
