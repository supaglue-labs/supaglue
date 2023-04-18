import type {
  Address,
  BaseCrmModel,
  BaseCrmModelNonRemoteParams,
  BaseCrmModelRemoteOnlyParams,
  CustomFields,
  EmailAddress,
  LifecycleStage,
  PhoneNumber,
  User,
} from '..';
import { Filter } from '../filter';
import type { Account } from './account';

export type BaseContact = BaseCrmModel & {
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
};

export type Contact = BaseContact &
  BaseCrmModelNonRemoteParams & {
    ownerId: string | null;
    owner?: User;
    accountId: string | null;
    account?: Account;
    // TODO: Support remote data and field mappings
  };

export type RemoteContact = BaseContact &
  BaseCrmModelRemoteOnlyParams & {
    remoteAccountId: string | null;
    remoteOwnerId: string | null;
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
