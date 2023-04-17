import type { Address, CustomFields, LifecycleStage, PhoneNumber, User } from '..';
import { Filter } from '../filter';

type BaseAccount = {
  remoteId: string;
  name: string | null;
  description: string | null;
  industry: string | null;
  website: string | null;
  numberOfEmployees: number | null;
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type Account = BaseAccount & {
  id: string;
  ownerId: string | null;
  owner?: User;
  lastModifiedAt: Date | null;
  // TODO: Support remote data
};

export type RemoteAccount = BaseAccount & {
  remoteOwnerId: string | null;
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};

type BaseAccountCreateParams = {
  // TODO: Associations
  // owner?: string | null;

  name?: string | null;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  numberOfEmployees?: number | null;
  addresses?: Address[];
  phoneNumbers?: PhoneNumber[];
  lifecycleStage?: LifecycleStage | null;

  ownerId?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // lastActivityAt?: Date | null;
  customFields?: CustomFields;
};

export type AccountCreateParams = BaseAccountCreateParams;
export type RemoteAccountCreateParams = BaseAccountCreateParams;

export type AccountUpdateParams = AccountCreateParams & {
  id: string;
};

export type RemoteAccountUpdateParams = RemoteAccountCreateParams & {
  remoteId: string;
};

export type AccountFilters = {
  website?: Filter;
};
