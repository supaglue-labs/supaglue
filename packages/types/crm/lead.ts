import type {
  Account,
  Address,
  BaseCrmModel,
  BaseCrmModelNonRemoteParams,
  BaseCrmModelRemoteOnlyParams,
  Contact,
  CustomFields,
  EmailAddress,
  PhoneNumber,
  User,
} from '..';
import { Filter } from '../filter';

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

export type Lead = BaseLead &
  BaseCrmModelNonRemoteParams & {
    convertedContactId: string | null;
    convertedContact?: Contact;
    convertedAccountId: string | null;
    convertedAccount?: Account;
    ownerId: string | null;
    owner?: User;
    // Support field mappings + remote data etc
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
  emailAddress?: Filter;
};
