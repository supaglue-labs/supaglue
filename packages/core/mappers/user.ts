import { CrmUser } from '@supaglue/db';
import { RemoteUser, User } from '@supaglue/types';
import { v4 as uuidv4 } from 'uuid';

export const toSnakecasedKeysUser = (user: User) => {
  return {
    id: user.id,
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
  id,
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
    id,
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

// TODO: Use prisma generator to generate return type
export const fromRemoteUserToDbUserParams = (connectionId: string, customerId: string, remoteUser: RemoteUser) => {
  const lastModifiedAt =
    remoteUser.remoteUpdatedAt || remoteUser.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(remoteUser.remoteUpdatedAt?.getTime() || 0, remoteUser.detectedOrRemoteDeletedAt?.getTime() || 0)
        )
      : undefined;

  return {
    id: uuidv4(),
    remote_id: remoteUser.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    name: remoteUser.name,
    email: remoteUser.email,
    is_active: remoteUser.isActive,
    remote_created_at: remoteUser.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteUser.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteUser.remoteWasDeleted,
    remote_deleted_at: remoteUser.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteUser.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    updated_at: new Date().toISOString(),
    raw_data: remoteUser.rawData,
  };
};
