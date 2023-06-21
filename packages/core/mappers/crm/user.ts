import type { SnakecasedKeysCrmUserV2, UserV2 } from '@supaglue/types/crm';

export const toSnakecasedKeysCrmUserV2 = (user: UserV2): SnakecasedKeysCrmUserV2 => {
  return {
    last_modified_at: user.lastModifiedAt,
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: user.isActive,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    is_deleted: user.isDeleted,
    raw_data: user.rawData,
  };
};
