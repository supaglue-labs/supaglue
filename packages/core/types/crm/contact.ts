import type { CrmAccount, CrmContact, CrmUser } from '@supaglue/db';
import type { Address, CustomFields, EmailAddress, PhoneNumber, User } from '..';
import { Filter } from '../filter';
import type { Account } from './account';

export type CrmContactExpanded = CrmContact & {
  account?: CrmAccount | null;
  owner?: CrmUser | null;
};

export type BaseContact = {
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
};

export type Contact = BaseContact & {
  id: string;
  ownerId: string | null;
  owner?: User;
  accountId: string | null;
  account?: Account;
  createdAt: Date | null;
  updatedAt: Date | null;
  wasDeleted: boolean;
  // TODO: Support remote data and field mappings
};

export type RemoteContact = BaseContact & {
  remoteId: string;
  remoteAccountId: string | null;
  remoteOwnerId: string | null;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

type BaseContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  accountId?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // lastActivityAt?: Date | null;
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

export type ContactFilters = {
  emailAddress?: Filter;
};
