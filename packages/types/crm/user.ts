import { BaseCrmModel } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysUser = SnakecasedKeys<User>;

export type SnakecasedKeysUserWithTenant = SnakecasedKeysUser & {
  provider_name: string;
  customer_id: string;
};

export type User = BaseCrmModel & {
  name: string | null;
  email: string | null;
  isActive: boolean | null;
};

export type UserTypes = {
  object: User;
  createParams: never;
  updateParams: never;
};
