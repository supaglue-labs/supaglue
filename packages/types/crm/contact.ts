import { BaseCrmModel, CustomFields } from '.';
import { Filter } from '../filter';
import { SnakecasedKeys } from '../snakecased_keys';
import { Address } from './common/address';
import { EmailAddress } from './common/email_address';
import { LifecycleStage } from './common/lifecycle_stage';
import { PhoneNumber } from './common/phone_number';

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
  id: string;
};

export type ContactFilters = {
  emailAddress?: Filter;
};

export type ContactTypes = {
  object: Contact;
  createParams: ContactCreateParams;
  updateParams: ContactUpdateParams;
};
