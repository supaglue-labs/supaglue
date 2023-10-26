import type { SnakecasedKeysEngagementUser, User } from '@supaglue/types/engagement';

export const toSnakecasedKeysEngagementUser = (user: User): SnakecasedKeysEngagementUser => {
  return {
    last_modified_at: user.lastModifiedAt,
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    is_deleted: user.isDeleted,
    raw_data: user.rawData,
    is_locked: user.isLocked,
  };
};
