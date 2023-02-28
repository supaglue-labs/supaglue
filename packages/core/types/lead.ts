import { CrmAccount, CrmContact, CrmLead } from '@prisma/client';
import { Account, Address, Contact, EmailAddress, PhoneNumber } from '.';

export type CrmLeadExpanded = CrmLead & {
  convertedAccount?: CrmAccount | null;
  convertedContact?: CrmContact | null;
};

type BaseLead = {
  owner: string | null;
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

export type Lead = BaseLead & {
  updatedAt: Date | null;
  createdAt: Date | null;
  convertedContactId: string | null;
  convertedContact?: Contact;
  convertedAccountId: string | null;
  convertedAccount?: Account;
  wasDeleted: boolean;
  id: string;
  // Support field mappings + remote data etc
};

export type RemoteLead = BaseLead & {
  remoteId: string;
  convertedRemoteContactId: string | null;
  convertedRemoteAccountId: string | null;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

type BaseLeadCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  leadSource?: string | null;
  company?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // convertedDate?: Date | null;
};

export type LeadCreateParams = BaseLeadCreateParams;
export type RemoteLeadCreateParams = BaseLeadCreateParams;

export type LeadUpdateParams = LeadCreateParams & {
  id: string;
};

export type RemoteLeadUpdateParams = RemoteLeadCreateParams & {
  remoteId: string;
};

export type LeadSyncUpsertParams = RemoteLead & {
  customerId: string;
  connectionId: string;
};
