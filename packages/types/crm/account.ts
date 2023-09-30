import type { BaseCrmModel, CustomFields, SnakecasedCrmTenantFields } from '.';
import type { EqualsFilter, Filter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, LifecycleStage, PhoneNumber } from './common';

export type SnakecasedKeysCrmAccount = SnakecasedKeys<Account>;
export type SnakecasedKeysCrmAccountWithTenant = SnakecasedKeysCrmAccount & SnakecasedCrmTenantFields;

type CoreAccount = {
  name: string | null;
  description: string | null;
  industry: string | null;
  website: string | null;
  numberOfEmployees: number | null;
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
  ownerId: string | null;
};

export type Account = BaseCrmModel & CoreAccount;

export type AccountCreateParams = Partial<CoreAccount> & {
  customFields?: CustomFields;
};

export type AccountUpdateParams = AccountCreateParams & {
  id: string;
};

export type AccountUpsertParams = {
  record: AccountCreateParams;
  upsertOn: {
    key: 'domain' | 'website';
    values: string[];
  };
};

export type AccountFilters = {
  website?: Filter;
  remoteId?: EqualsFilter;
};

export type RemoteAccountTypes = {
  object: Account;
  createParams: AccountCreateParams;
  updateParams: AccountUpdateParams;
  upsertParams: AccountUpsertParams;
  searchParams: never;
};
