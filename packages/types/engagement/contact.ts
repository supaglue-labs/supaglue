import type { CustomFields } from '.';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';
import type { Address } from './common/address';
import type { EmailAddress } from './common/email_address';
import type { PhoneNumber } from './common/phone_number';

export type SnakecasedKeysEngagementContact = SnakecasedKeys<Contact>;
export type SnakecasedKeysEngagementContactWithTenant = SnakecasedKeysEngagementContact &
  SnakecasedEngagementTenantFields;

type CoreContact = {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  address: Address | null;
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  openCount: number;
  clickCount: number;
  replyCount: number;
  bouncedCount: number;
  ownerId: string | null;
};

export type Contact = BaseEngagementModel & CoreContact;

export type ContactCreateParams = Omit<
  Partial<CoreContact>,
  'openCount' | 'clickCount' | 'replyCount' | 'bouncedCount'
> & {
  customFields?: CustomFields;
};

export type ContactUpdateParams = ContactCreateParams & {
  id: string;
};

export type RemoteContactTypes = {
  object: Contact;
  createParams: ContactCreateParams;
  updateParams: ContactUpdateParams;
};
