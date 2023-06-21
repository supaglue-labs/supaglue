import type { BaseCrmModel, CustomFields, SnakecasedCrmTenantFields } from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, EmailAddress, LifecycleStage, PhoneNumber } from './common';

export type SnakecasedKeysCrmContact = SnakecasedKeys<Contact>;
export type SnakecasedKeysCrmContactWithTenant = SnakecasedKeysCrmContact & SnakecasedCrmTenantFields;

type CoreContact = {
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
  ownerId: string | null;
  accountId: string | null;
};

export type Contact = BaseCrmModel & CoreContact;

export type ContactCreateParams = Partial<CoreContact> & {
  customFields?: CustomFields;
};

export type ContactUpdateParams = ContactCreateParams & {
  id: string;
};

export type ContactFilters = {
  emailAddress?: EqualsFilter;
  remoteId?: EqualsFilter;
};

export type RemoteContactTypes = {
  object: Contact;
  createParams: ContactCreateParams;
  updateParams: ContactUpdateParams;
};
