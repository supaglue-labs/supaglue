import { BaseEngagementModel } from './base';
import { Address } from './common/address';
import { EmailAddress } from './common/email_address';
import { PhoneNumber } from './common/phone_number';

export type Contact = BaseEngagementModel & {
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  address: Address;
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  openCount: number | null;
  clickCount: number | null;
  replyCount: number | null;
  bouncedCount: number | null;
};

export type ContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: Address | null;
  emailAddresses?: EmailAddress[];
};

export type ContactTypes = {
  object: Contact;
  createParams: ContactCreateParams;
};
