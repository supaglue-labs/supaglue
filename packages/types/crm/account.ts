import type { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams, CustomFields } from '.';
import type { EqualsFilter, Filter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, LifecycleStage, PhoneNumber } from './common';

export type SnakecasedKeysCrmAccount = SnakecasedKeys<Account>;
export type SnakecasedKeysCrmSimpleAccount = SnakecasedKeys<SimpleAccount>;
export type SnakecasedKeysCrmSimpleAccountWithTenant = SnakecasedKeysCrmSimpleAccount & {
  provider_name: string;
  customer_id: string;
};

type BaseAccount = BaseCrmModel & {
  name: string | null;
  description: string | null;
  industry: string | null;
  website: string | null;
  numberOfEmployees: number | null;
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Account = BaseAccount &
  BaseCrmModelNonRemoteParams & {
    ownerId: string | null;
    rawData?: Record<string, any>;
  };

export type SimpleAccount = BaseAccount & {
  lastModifiedAt: Date;
  remoteOwnerId: string | null;
  rawData: Record<string, any>;
};

export type RemoteAccount = BaseAccount &
  BaseCrmModelRemoteOnlyParams & {
    remoteOwnerId: string | null;
    rawData: Record<string, any>;
  };

type BaseAccountCreateParams = {
  // TODO: Associations
  // owner?: string | null;

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

export type AccountCreateParams = BaseAccountCreateParams;
export type RemoteAccountCreateParams = BaseAccountCreateParams;

export type AccountUpdateParams = AccountCreateParams & {
  id: string;
};

export type RemoteAccountUpdateParams = RemoteAccountCreateParams & {
  remoteId: string;
};

export type AccountFilters = {
  website?: Filter;
  remoteId?: EqualsFilter;
};

export type RemoteAccountTypes = {
  object: RemoteAccount;
  createParams: RemoteAccountCreateParams;
  updateParams: RemoteAccountUpdateParams;
};
