import type { Address, BaseCrmModel, CustomFields, EmailAddress, LifecycleStage, PhoneNumber } from '..';
import { Filter } from '../filter';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysContact = SnakecasedKeys<Contact>;

export type SnakecasedKeysContactWithTenant = SnakecasedKeysContact & {
  provider_name: string;
  customer_id: string;
};

export type Contact = BaseCrmModel & {
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lifecycleStage: LifecycleStage | null;

  accountId: string | null;
  ownerId: string | null;

  lastActivityAt: Date | null;
};

export type ContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  addresses?: Address[];
  emailAddresses?: EmailAddress[];
  phoneNumbers?: PhoneNumber[];
  lifecycleStage?: LifecycleStage | null;

  accountId?: string | null;
  ownerId?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // lastActivityAt?: Date | null;

  customFields?: CustomFields;
};

export type ContactUpdateParams = ContactCreateParams & {
  remoteId: string;
};

export type ContactFilters = {
  emailAddress?: Filter;
};
