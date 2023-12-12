import type {
  Account,
  BaseCrmModel,
  BaseSearchParams,
  Contact,
  CrmGetParams,
  CrmListParams,
  CustomFields,
  SnakecasedCrmTenantFields,
  User,
} from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, EmailAddress, PhoneNumber } from './common/base';

export type SnakecasedKeysCrmLead = SnakecasedKeys<Lead>;
export type SnakecasedKeysCrmLeadWithTenant = SnakecasedKeysCrmLead & SnakecasedCrmTenantFields;

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
  convertedContact?: Contact;
  convertedAccountId: string | null;
  convertedAccount?: Account;
  ownerId: string | null;
  owner?: User;
};

export type Lead = BaseCrmModel & CoreLead;

export type LeadCreateParams = Partial<CoreLead> & {
  customFields?: CustomFields;
};

export type LeadUpdateParams = LeadCreateParams & {
  id: string;
};

export type LeadUpsertParams = {
  record: LeadCreateParams;
  upsertOn: {
    key: 'email';
    values: string[];
  };
};

export type LeadSearchParams = BaseSearchParams & {
  filter: {
    email: string;
  };
};

export type LeadFilters = {
  emailAddress?: EqualsFilter;
  remoteId?: EqualsFilter;
};

export type RemoteLeadTypes = {
  object: Lead;
  createParams: LeadCreateParams;
  updateParams: LeadUpdateParams;
  upsertParams: LeadUpsertParams;
  searchParams: LeadSearchParams;
  listParams: CrmListParams;
  getParams: CrmGetParams;
};
