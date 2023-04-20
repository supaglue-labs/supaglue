import { SnakecasedKeysUser, User } from '@supaglue/types';

export const toSnakecasedKeysUser = (user: User): SnakecasedKeysUser => {
  return {
    last_modified_at: user.lastModifiedAt,
    remote_id: user.remoteId,
    name: user.name,
    email: user.email,
    is_active: user.isActive,
    remote_created_at: user.remoteCreatedAt,
    remote_updated_at: user.remoteUpdatedAt,
    remote_was_deleted: user.remoteWasDeleted,
    remote_deleted_at: user.remoteDeletedAt,
    detected_or_remote_deleted_at: user.detectedOrRemoteDeletedAt,
  };
};
