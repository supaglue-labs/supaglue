import { BaseCrmModel, CustomFields } from '..';
import { SnakecasedKeys } from '../snakecased_keys';
import { Address } from './common/address';
import { EmailAddress } from './common/email_address';
import { PhoneNumber } from './common/phone_number';

export type SnakecasedKeysLead = SnakecasedKeys<Lead>;

export type SnakecasedKeysLeadWithTenant = SnakecasedKeysLead & {
  provider_name: string;
  customer_id: string;
};

export type Lead = BaseCrmModel & {
  leadSource: string | null;
  title: string | null;
  company: string | null;
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  convertedDate: Date | null;

  convertedContactId: string | null;
  convertedAccountId: string | null;
  ownerId: string | null;
};

export type LeadCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  leadSource?: string | null;
  company?: string | null;
  addresses?: Address[];
  emailAddresses?: EmailAddress[];

  ownerId?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // convertedDate?: Date | null;

  customFields?: CustomFields;
};

export type LeadUpdateParams = LeadCreateParams & {
  id: string;
};

export type LeadTypes = {
  object: Lead;
  createParams: LeadCreateParams;
  updateParams: LeadUpdateParams;
};
