import { CustomFields } from '.';
import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelV2, SnakecasedEngagementTenantFields } from './base';
import { Address } from './common/address';
import { EmailAddress } from './common/email_address';
import { PhoneNumber } from './common/phone_number';

export type SnakecasedKeysEngagementContact = SnakecasedKeys<Contact>;
export type SnakecasedKeysEngagementContactV2 = SnakecasedKeys<ContactV2>;
export type SnakecasedKeysEngagementContactV2WithTenant = SnakecasedKeysEngagementContactV2 &
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

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Contact = BaseEngagementModel & CoreContact;

export type ContactV2 = BaseEngagementModelV2 & CoreContact;

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
  object: ContactV2;
  createParams: ContactCreateParams;
  updateParams: ContactUpdateParams;
};
