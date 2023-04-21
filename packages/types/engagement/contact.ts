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
  openCount: number;
  clickCount: number;
  replyCount: number;
  bouncedCount: number;
};

export type ContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: Address | null;
  emailAddresses?: EmailAddress[];
};
