import type { SnakecasedKeysEngagementUserV2, UserV2 } from '@supaglue/types/engagement';

export const toSnakecasedKeysEngagementUserV2 = (user: UserV2): SnakecasedKeysEngagementUserV2 => {
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
  };
};
