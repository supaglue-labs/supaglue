import type { CrmUser, Prisma } from '@supaglue/db';
import type { GetInternalParams } from '@supaglue/types';
import type { RemoteUser, SnakecasedKeysCrmUser, SnakecasedKeysCrmUserV2, User } from '@supaglue/types/crm';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysCrmUser = (user: User): SnakecasedKeysCrmUser => {
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

export const toSnakecasedKeysCrmSimpleUser = (user: RemoteUser): SnakecasedKeysCrmUserV2 => {
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

export const fromRemoteUserToModel = (
  connectionId: string,
  customerId: string,
  remoteUser: RemoteUser
): Prisma.CrmUserCreateInput => {
  return {
    id: uuidv5(remoteUser.id, connectionId),
    remoteId: remoteUser.id,
    customerId,
    connectionId,
    name: remoteUser.name,
    email: remoteUser.email,
    isActive: remoteUser.isActive,
    remoteCreatedAt: remoteUser.createdAt?.toISOString(),
    remoteUpdatedAt: remoteUser.updatedAt?.toISOString(),
    remoteWasDeleted: remoteUser.isDeleted,
    lastModifiedAt: remoteUser.lastModifiedAt?.toISOString(),
    rawData: remoteUser.rawData,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteUserToDbUserParams = (connectionId: string, customerId: string, remoteUser: RemoteUser) => {
  return {
    id: uuidv5(remoteUser.id, connectionId),
    remote_id: remoteUser.id,
    customer_id: customerId,
    connection_id: connectionId,
    name: remoteUser.name,
    email: remoteUser.email,
    is_active: remoteUser.isActive,
    remote_created_at: remoteUser.createdAt?.toISOString(),
    remote_updated_at: remoteUser.updatedAt?.toISOString(),
    remote_was_deleted: remoteUser.isDeleted,
    last_modified_at: remoteUser.lastModifiedAt?.toISOString(),
    updated_at: new Date().toISOString(),
    raw_data: remoteUser.rawData,
  };
};
