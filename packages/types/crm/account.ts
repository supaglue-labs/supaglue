import type { Address, BaseCrmModel, CustomFields, LifecycleStage, PhoneNumber } from '..';
import { Filter } from '../filter';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysAccount = SnakecasedKeys<Account>;

export type SnakecasedKeysAccountWithTenant = SnakecasedKeysAccount & {
  provider_name: string;
  customer_id: string;
};

export type Account = BaseCrmModel & {
  name: string | null;
  description: string | null;
  industry: string | null;
  website: string | null;
  numberOfEmployees: number | null;
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  lifecycleStage: LifecycleStage | null;

  ownerId: string | null;

  lastActivityAt: Date | null;
};

export type AccountCreateParams = {
  name?: string | null;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  numberOfEmployees?: number | null;
  addresses?: Address[];
  phoneNumbers?: PhoneNumber[];
  lifecycleStage?: LifecycleStage | null;

  ownerId?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // lastActivityAt?: Date | null;
  customFields?: CustomFields;
};

export type AccountUpdateParams = AccountCreateParams & {
  id: string;
};

export type AccountFilters = {
  website?: Filter;
};
