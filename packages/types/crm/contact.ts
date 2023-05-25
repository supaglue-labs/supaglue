import type { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelV2, CustomFields } from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, EmailAddress, LifecycleStage, PhoneNumber } from './common';

export type SnakecasedKeysCrmContact = SnakecasedKeys<Contact>;
export type SnakecasedKeysCrmContactV2 = SnakecasedKeys<ContactV2>;
export type SnakecasedKeysCrmContactV2WithTenant = SnakecasedKeysCrmContactV2 & {
  provider_name: string;
  customer_id: string;
};

type BaseContact = BaseCrmModel & {
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Contact = BaseContact &
  BaseCrmModelNonRemoteParams & {
    ownerId: string | null;
    accountId: string | null;
    rawData?: Record<string, any>;
  };

export type RemoteContact = BaseCrmModelV2 & {
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
  accountId: string | null;
  ownerId: string | null;
};

export type ContactV2 = RemoteContact;

type BaseContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  accountId?: string | null;
  ownerId?: string | null;
  addresses?: Address[];
  emailAddresses?: EmailAddress[];
  phoneNumbers?: PhoneNumber[];
  lifecycleStage?: LifecycleStage | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // lastActivityAt?: Date | null;
  customFields?: CustomFields;
};

export type ContactCreateParams = BaseContactCreateParams;
export type RemoteContactCreateParams = BaseContactCreateParams;

export type ContactUpdateParams = ContactCreateParams & {
  id: string;
};

export type RemoteContactUpdateParams = RemoteContactCreateParams & {
  remoteId: string;
};

export type ContactFilters = {
  emailAddress?: EqualsFilter;
  remoteId?: EqualsFilter;
};

export type RemoteContactTypes = {
  object: RemoteContact;
  createParams: RemoteContactCreateParams;
  updateParams: RemoteContactUpdateParams;
};
