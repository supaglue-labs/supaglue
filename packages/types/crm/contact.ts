import { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams, CustomFields } from '.';
import { Address, EmailAddress, LifecycleStage, PhoneNumber } from '../base';
import { EqualsFilter } from '../filter';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysContact = SnakecasedKeys<Contact>;
export type SnakecasedKeysSimpleContact = SnakecasedKeys<SimpleContact>;
export type SnakecasedKeysSimpleContactWithTenant = SnakecasedKeysSimpleContact & {
  provider_name: string;
  customer_id: string;
};

export type BaseContact = BaseCrmModel & {
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

export type SimpleContact = BaseContact & {
  lastModifiedAt: Date;
  remoteOwnerId: string | null;
  remoteAccountId: string | null;
  rawData: Record<string, any>;
};

export type RemoteContact = BaseContact &
  BaseCrmModelRemoteOnlyParams & {
    remoteAccountId: string | null;
    remoteOwnerId: string | null;
    rawData: Record<string, any>;
  };

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
