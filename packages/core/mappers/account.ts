import { Account, SnakecasedKeysAccount } from '@supaglue/types';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysAccount = (account: Account): SnakecasedKeysAccount => {
  return {
    owner_id: account.ownerId,
    last_modified_at: account.lastModifiedAt,
    remote_id: account.remoteId,
    name: account.name,
    description: account.description,
    industry: account.industry,
    website: account.website,
    number_of_employees: account.numberOfEmployees,
    addresses: account.addresses.map(toSnakecasedKeysAddress),
    phone_numbers: account.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    last_activity_at: account.lastActivityAt,
    lifecycle_stage: account.lifecycleStage,
    remote_created_at: account.remoteCreatedAt,
    remote_updated_at: account.remoteUpdatedAt,
    remote_was_deleted: account.remoteWasDeleted,
    remote_deleted_at: account.remoteDeletedAt,
    detected_or_remote_deleted_at: account.detectedOrRemoteDeletedAt,
  };
};
