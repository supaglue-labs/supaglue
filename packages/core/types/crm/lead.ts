import type { CrmAccount, CrmContact, CrmLead, CrmUser } from '@supaglue/db';
import type { Account, Address, Contact, CustomFields, EmailAddress, PhoneNumber, User } from '..';

export type CrmLeadExpanded = CrmLead & {
  convertedAccount?: CrmAccount | null;
  convertedContact?: CrmContact | null;
  owner?: CrmUser | null;
};

type BaseLead = {
  leadSource: string | null;
  title: string | null;
  company: string | null;
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  convertedDate: Date | null;
  remoteUpdatedAt: Date | null;
  remoteCreatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type Lead = BaseLead & {
  convertedContactId: string | null;
  convertedContact?: Contact;
  convertedAccountId: string | null;
  convertedAccount?: Account;
  ownerId: string | null;
  owner?: User;
  id: string;
  remoteId: string;
  lastModifiedAt: Date | null;
  // Support field mappings + remote data etc
};

export type RemoteLead = BaseLead & {
  remoteId: string;
  convertedRemoteContactId: string | null;
  convertedRemoteAccountId: string | null;
  remoteOwnerId: string | null;
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
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
