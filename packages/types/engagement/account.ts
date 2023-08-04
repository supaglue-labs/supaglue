import type { CustomFields } from '.';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysEngagementAccount = SnakecasedKeys<Account>;
export type SnakecasedKeysEngagementAccountWithTenant = SnakecasedKeysEngagementAccount &
  SnakecasedEngagementTenantFields;

type CoreAccount = {
  name: string | null;
  domain: string | null;
  ownerId: string | null;
};

export type Account = BaseEngagementModel & CoreAccount;

export type AccountCreateParams = Partial<CoreAccount> & {
  customFields?: CustomFields;
};

export type AccountUpdateParams = AccountCreateParams & {
  id: string;
};

export type RemoteAccountTypes = {
  object: Account;
  createParams: AccountCreateParams;
  updateParams: AccountUpdateParams;
};
