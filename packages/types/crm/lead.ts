import type { BaseCrmModel, BaseCrmModelV2, CustomFields, SnakecasedCrmTenantFields } from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, EmailAddress, PhoneNumber } from './common/base';

export type SnakecasedKeysCrmLead = SnakecasedKeys<Lead>;
export type SnakecasedKeysCrmLeadV2 = SnakecasedKeys<LeadV2>;
export type SnakecasedKeysCrmLeadV2WithTenant = SnakecasedKeysCrmLeadV2 & SnakecasedCrmTenantFields;

type CoreLead = {
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

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Lead = BaseCrmModel & CoreLead;

export type LeadV2 = BaseCrmModelV2 & CoreLead;

export type LeadCreateParams = Partial<CoreLead> & {
  customFields?: CustomFields;
};

export type LeadUpdateParams = LeadCreateParams & {
  id: string;
};

export type LeadFilters = {
  emailAddress?: EqualsFilter;
  remoteId?: EqualsFilter;
};

export type RemoteLeadTypes = {
  object: LeadV2;
  createParams: LeadCreateParams;
  updateParams: LeadUpdateParams;
};
