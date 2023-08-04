import type { Account, SnakecasedKeysEngagementAccount } from '@supaglue/types/engagement';

export const toSnakecasedKeysEngagementAccount = (account: Account): SnakecasedKeysEngagementAccount => {
  return {
    owner_id: account.ownerId,
    last_modified_at: account.lastModifiedAt,
    id: account.id,
    name: account.name,
    domain: account.domain,
    created_at: account.createdAt,
    updated_at: account.updatedAt,
    is_deleted: account.isDeleted,
    raw_data: account.rawData,
  };
};
