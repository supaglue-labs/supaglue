import { CustomFields } from '.';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from './base';
import { Address } from './common/address';
import { EmailAddress } from './common/email_address';
import { PhoneNumber } from './common/phone_number';

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
    rawData?: Record<string, any>;
  };

export type RemoteContact = BaseContact &
  BaseEngagementModelRemoteOnlyParams & {
    rawData: Record<string, any>;
  };

export type BaseContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  address?: Address | null;
  emailAddresses?: EmailAddress[];
  phoneNumbers?: PhoneNumber[];

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

export type ContactTypes = {
  object: RemoteContact;
  createParams: RemoteContactCreateParams;
  updateParams: RemoteContactUpdateParams;
};
