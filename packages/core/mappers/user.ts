import { CrmUser } from '@supaglue/db';
import { User } from '@supaglue/types';

export const toSnakecasedKeysUser = (user: User) => {
  return {
    last_modified_at: user.lastModifiedAt,
    remote_id: user.remoteId,
    name: user.name,
    email: user.email,
    is_active: user.isActive,
    remote_created_at: user.remoteCreatedAt,
    remote_updated_at: user.remoteUpdatedAt,
    remote_was_deleted: user.remoteWasDeleted,
  };
};

export const fromUserModel = ({
  remoteId,
  name,
  email,
  isActive,
  remoteCreatedAt,
  remoteUpdatedAt,
  remoteWasDeleted,
  lastModifiedAt,
}: CrmUser): User => {
  return {
    remoteId,
    name,
    email,
    isActive,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
  };
};
