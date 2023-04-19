import type { Address, BaseCrmModel, CustomFields, LifecycleStage, PhoneNumber } from '..';
import { Filter } from '../filter';

export type Account = BaseCrmModel & {
  name: string | null;
  description: string | null;
  industry: string | null;
  website: string | null;
  numberOfEmployees: number | null;
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  lifecycleStage: LifecycleStage | null;

  ownerId: string | null;

  lastActivityAt: Date | null;
};

export type AccountCreateParams = {
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

export type AccountUpdateParams = AccountCreateParams & {
  remoteId: string;
};

export type AccountFilters = {
  website?: Filter;
};
