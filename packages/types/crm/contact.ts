import type { BaseCrmModelV2, CustomFields, SnakecasedCrmTenantFields } from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { Address, EmailAddress, LifecycleStage, PhoneNumber } from './common';

export type SnakecasedKeysCrmContactV2 = SnakecasedKeys<ContactV2>;
export type SnakecasedKeysCrmContactV2WithTenant = SnakecasedKeysCrmContactV2 & SnakecasedCrmTenantFields;

type CoreContact = {
  firstName: string | null;
  lastName: string | null;
  addresses: Address[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  lastActivityAt: Date | null;
  lifecycleStage: LifecycleStage | null;
  ownerId: string | null;
  accountId: string | null;
};

export type ContactV2 = BaseCrmModelV2 & CoreContact;

export type ContactCreateParams = Partial<CoreContact> & {
  customFields?: CustomFields;
};

export type ContactUpdateParams = ContactCreateParams & {
  id: string;
};

export type ContactFilters = {
  emailAddress?: EqualsFilter;
  remoteId?: EqualsFilter;
};

export type RemoteContactTypes = {
  object: ContactV2;
  createParams: ContactCreateParams;
  updateParams: ContactUpdateParams;
};
