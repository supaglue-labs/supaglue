import { CrmUser } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { RemoteUser, SnakecasedKeysSimpleUser, SnakecasedKeysUser, User } from '@supaglue/types/crm';
import { v5 as uuidv5 } from 'uuid';
import { getLastModifiedAt } from '../../services';

export const toSnakecasedKeysUser = (user: User): SnakecasedKeysUser => {
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
    raw_data: user.rawData,
  };
};

export const toSnakecasedKeysSimpleUser = (user: RemoteUser): SnakecasedKeysSimpleUser => {
  return {
    last_modified_at: getLastModifiedAt(user),
    remote_id: user.remoteId,
    name: user.name,
    email: user.email,
    is_active: user.isActive,
    remote_created_at: user.remoteCreatedAt,
    remote_updated_at: user.remoteUpdatedAt,
    remote_was_deleted: user.remoteWasDeleted,
    raw_data: user.rawData,
  };
};

export const fromUserModel = (
  {
    id,
    remoteId,
    name,
    email,
    isActive,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: CrmUser,
  getParams?: GetInternalParams
): User => {
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
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
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
    id: uuidv5(remoteUser.remoteId, connectionId),
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
