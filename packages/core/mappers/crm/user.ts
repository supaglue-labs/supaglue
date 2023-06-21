import type { SnakecasedKeysCrmUser, User } from '@supaglue/types/crm';

export const toSnakecasedKeysCrmUser = (user: User): SnakecasedKeysCrmUser => {
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
