import type { Account, SnakecasedKeysCrmAccount } from '@supaglue/types/crm';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysCrmAccountV2 = (account: Account): SnakecasedKeysCrmAccount => {
  return {
    owner_id: account.ownerId,
    last_modified_at: account.lastModifiedAt,
    id: account.id,
    name: account.name,
    description: account.description,
    industry: account.industry,
    website: account.website,
    number_of_employees: account.numberOfEmployees,
    addresses: account.addresses.map(toSnakecasedKeysAddress),
    phone_numbers: account.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    last_activity_at: account.lastActivityAt,
    lifecycle_stage: account.lifecycleStage,
    created_at: account.createdAt,
    updated_at: account.updatedAt,
    is_deleted: account.isDeleted,
    raw_data: account.rawData,
  };
};
