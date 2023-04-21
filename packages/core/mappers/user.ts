import { SnakecasedKeysUser, User } from '@supaglue/types';

export const toSnakecasedKeysUser = (user: User): SnakecasedKeysUser => {
  return {
    last_modified_at: user.lastModifiedAt,
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: user.isActive,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    was_deleted: user.wasDeleted,
    deleted_at: user.deletedAt,
    detected_or_deleted_at: user.detectedOrDeletedAt,
  };
};
