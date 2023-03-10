import { CrmUser } from '@supaglue/db';
import { v4 as uuidv4 } from 'uuid';
import { RemoteUser, User } from '../types/crm';

export const fromUserModel = ({
  id,
  name,
  email,
  isActive,
  remoteCreatedAt,
  remoteUpdatedAt,
  remoteWasDeleted,
}: CrmUser): User => {
  return {
    id,
    name,
    email,
    isActive,
    createdAt: remoteCreatedAt,
    updatedAt: remoteUpdatedAt,
    wasDeleted: remoteWasDeleted,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteUserToDbUserParams = (connectionId: string, customerId: string, remoteUser: RemoteUser) => {
  return {
    id: uuidv4(),
    connection_id: connectionId,
    customer_id: customerId,
    remote_id: remoteUser.remoteId,
    name: remoteUser.name,
    email: remoteUser.email,
    is_active: remoteUser.isActive,
    remote_created_at: remoteUser.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteUser.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteUser.remoteWasDeleted,
    updated_at: new Date().toISOString(),
  };
};
