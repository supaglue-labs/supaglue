import type { EngagementUser } from '@supaglue/db';
import type { GetInternalParams } from '@supaglue/types';
import type {
  SnakecasedKeysEngagementUser,
  SnakecasedKeysEngagementUserV2,
  User,
  UserV2,
} from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysEngagementUser = (user: User): SnakecasedKeysEngagementUser => {
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
export const fromRemoteUserToDbUserParams = (connectionId: string, customerId: string, remoteUser: UserV2) => {
  return {
    id: uuidv5(remoteUser.id, connectionId),
    remote_id: remoteUser.id,
    customer_id: customerId,
    connection_id: connectionId,
    first_name: remoteUser.firstName,
    last_name: remoteUser.lastName,
    email: remoteUser.email,
    remote_created_at: remoteUser.createdAt?.toISOString(),
    remote_updated_at: remoteUser.updatedAt?.toISOString(),
    remote_was_deleted: remoteUser.isDeleted,
    last_modified_at: remoteUser.lastModifiedAt?.toISOString(),
    updated_at: new Date().toISOString(),
    raw_data: remoteUser.rawData,
  };
};
