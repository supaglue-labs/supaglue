import { CustomFields } from '.';
import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from './base';
import { Address } from './common/address';
import { EmailAddress } from './common/email_address';
import { PhoneNumber } from './common/phone_number';

export type SnakecasedKeysEngagementContact = SnakecasedKeys<Contact>;

export type SnakecasedKeysEngagementContactWithTenant = SnakecasedKeysEngagementContact & {
  provider_name: string;
  customer_id: string;
};

export type BaseContact = BaseEngagementModel & {
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
};

export type Contact = BaseContact &
  BaseEngagementModelNonRemoteParams & {
    ownerId: string | null;
    rawData?: Record<string, any>;
  };

export type RemoteContact = BaseContact &
  BaseEngagementModelRemoteOnlyParams & {
    remoteOwnerId: string | null;
    rawData: Record<string, any>;
  };

export type BaseContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: Address | null;
  emailAddresses?: EmailAddress[];
  phoneNumbers?: PhoneNumber[];
  ownerId?: string | null;

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

export type RemoteContactTypes = {
  object: RemoteContact;
  createParams: RemoteContactCreateParams;
  updateParams: RemoteContactUpdateParams;
};
