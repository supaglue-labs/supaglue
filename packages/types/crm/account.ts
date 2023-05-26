import type { BaseCrmModel, BaseCrmModelV2, CustomFields, SnakecasedCrmTenantFields } from '.';
import type { EqualsFilter, Filter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, LifecycleStage, PhoneNumber } from './common';

export type SnakecasedKeysCrmAccount = SnakecasedKeys<Account>;
export type SnakecasedKeysCrmAccountV2 = SnakecasedKeys<AccountV2>;
export type SnakecasedKeysCrmAccountV2WithTenant = SnakecasedKeysCrmAccountV2 & SnakecasedCrmTenantFields;

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

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Account = BaseCrmModel & CoreAccount;

export type AccountV2 = BaseCrmModelV2 & CoreAccount;

export type AccountCreateParams = Partial<CoreAccount> & {
  customFields?: CustomFields;
};

export type AccountUpdateParams = AccountCreateParams & {
  id: string;
};

export type AccountFilters = {
  website?: Filter;
  remoteId?: EqualsFilter;
};

export type RemoteAccountTypes = {
  object: AccountV2;
  createParams: AccountCreateParams;
  updateParams: AccountUpdateParams;
};
