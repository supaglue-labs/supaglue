import type { CrmAccount, CrmContact, CrmUser } from '@supaglue/db';
import type { Address, CustomFields, EmailAddress, LifecycleStage, PhoneNumber, User } from '..';
import { Filter } from '../filter';
import type { Account } from './account';

export type CrmContactExpanded = CrmContact & {
  account?: CrmAccount | null;
  owner?: CrmUser | null;
};

export type BaseContact = {
  remoteId: string;
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type Contact = BaseContact & {
  id: string;
  ownerId: string | null;
  owner?: User;
  accountId: string | null;
  account?: Account;
  lastModifiedAt: Date | null;
  // TODO: Support remote data and field mappings
};

export type RemoteContact = BaseContact & {
  remoteAccountId: string | null;
  remoteOwnerId: string | null;
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};

type BaseContactCreateParams = {
  firstName?: string | null;
  lastName?: string | null;
  accountId?: string | null;
  ownerId?: string | null;
  addresses?: Address[];
  emailAddresses?: EmailAddress[];
  phoneNumbers?: PhoneNumber[];
  lifecycleStage?: LifecycleStage | null;

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
