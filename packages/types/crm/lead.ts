import type { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams, CustomFields } from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, EmailAddress, PhoneNumber } from './common/base';

export type SnakecasedKeysCrmLead = SnakecasedKeys<Lead>;
export type SnakecasedKeysCrmSimpleLead = SnakecasedKeys<SimpleLead>;
export type SnakecasedKeysCrmSimpleLeadWithTenant = SnakecasedKeysCrmSimpleLead & {
  provider_name: string;
  customer_id: string;
};

type BaseLead = BaseCrmModel & {
  leadSource: string | null;
  title: string | null;
  company: string | null;
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  convertedDate: Date | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Lead = BaseLead &
  BaseCrmModelNonRemoteParams & {
    convertedContactId: string | null;
    convertedAccountId: string | null;
    ownerId: string | null;
    rawData?: Record<string, any>;
  };

export type SimpleLead = BaseLead & {
  lastModifiedAt: Date;
  convertedRemoteContactId: string | null;
  convertedRemoteAccountId: string | null;
  remoteOwnerId: string | null;
  rawData: Record<string, any>;
};

export type RemoteLead = BaseLead &
  BaseCrmModelRemoteOnlyParams & {
    convertedRemoteContactId: string | null;
    convertedRemoteAccountId: string | null;
    remoteOwnerId: string | null;
    rawData: Record<string, any>;
  };

type BaseLeadCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  leadSource?: string | null;
  company?: string | null;
  addresses?: Address[];
  emailAddresses?: EmailAddress[];

  ownerId?: string | null;
  convertedContactId?: string | null;
  convertedAccountId?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // convertedDate?: Date | null;

  customFields?: CustomFields;
};

export type LeadCreateParams = BaseLeadCreateParams;
export type RemoteLeadCreateParams = BaseLeadCreateParams;

export type LeadUpdateParams = LeadCreateParams & {
  id: string;
};

export type RemoteLeadUpdateParams = RemoteLeadCreateParams & {
  remoteId: string;
};

export type LeadFilters = {
  emailAddress?: EqualsFilter;
  remoteId?: EqualsFilter;
};

export type RemoteLeadTypes = {
  object: RemoteLead;
  createParams: RemoteLeadCreateParams;
  updateParams: RemoteLeadUpdateParams;
};
