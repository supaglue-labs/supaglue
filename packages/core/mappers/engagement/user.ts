import { EngagementUser } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { RemoteUser, User } from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysUser = (user: User) => {
  return {
    id: user.id,
    last_modified_at: user.lastModifiedAt,
    remote_id: user.remoteId,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
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
    firstName,
    lastName,
    email,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: EngagementUser,
  getParams?: GetInternalParams
): User => {
  return {
    id,
    remoteId,
    firstName,
    lastName,
    email,
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
    first_name: remoteUser.firstName,
    last_name: remoteUser.lastName,
    email: remoteUser.email,
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
