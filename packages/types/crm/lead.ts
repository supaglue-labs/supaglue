import type { BaseCrmModel, BaseCrmModelNonRemoteParams, BaseCrmModelRemoteOnlyParams, CustomFields } from '.';
import { Address, EmailAddress, PhoneNumber } from '../base';
import { EqualsFilter } from '../filter';
import { SnakecasedKeys } from '../snakecased_keys';

export type SnakecasedKeysLead = SnakecasedKeys<Lead>;
export type SnakecasedKeysSimpleLead = SnakecasedKeys<SimpleLead>;
export type SnakecasedKeysSimpleLeadWithTenant = SnakecasedKeysSimpleLead & {
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
