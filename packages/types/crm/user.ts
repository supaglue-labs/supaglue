import type { BaseCrmModel, SnakecasedCrmTenantFields } from '.';
import type { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysCrmUser = SnakecasedKeys<User>;
export type SnakecasedKeysCrmUserWithTenant = SnakecasedKeysCrmUser & SnakecasedCrmTenantFields;

type CoreUser = {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type User = BaseCrmModel & CoreUser;

export type RemoteUserTypes = {
  object: User;
  createParams: never;
  updateParams: never;
  upsertParams: never;
  searchParams: never;
};
