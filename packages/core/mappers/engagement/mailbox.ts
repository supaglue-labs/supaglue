import { EngagementMailbox } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { Mailbox, RemoteMailbox, SnakecasedKeysMailbox, SnakecasedKeysMailboxV2 } from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysMailbox = (mailbox: Mailbox): SnakecasedKeysMailbox => {
  return {
    id: mailbox.id,
    user_id: mailbox.userId,
    last_modified_at: mailbox.lastModifiedAt,
    remote_id: mailbox.remoteId,
    email: mailbox.email,
    remote_created_at: mailbox.remoteCreatedAt,
    remote_updated_at: mailbox.remoteUpdatedAt,
    remote_was_deleted: mailbox.remoteWasDeleted,
    raw_data: mailbox.rawData,
  };
};

export const toSnakecasedKeysMailboxV2 = (mailbox: RemoteMailbox): SnakecasedKeysMailboxV2 => {
  return {
    user_id: mailbox.userId,
    last_modified_at: mailbox.lastModifiedAt,
    id: mailbox.id,
    email: mailbox.email,
    created_at: mailbox.createdAt,
    updated_at: mailbox.updatedAt,
    is_deleted: mailbox.isDeleted,
    raw_data: mailbox.rawData,
  };
};

export const fromMailboxModel = (
  {
    id,
    remoteId,
    userId,
    email,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: EngagementMailbox,
  getParams?: GetInternalParams
): Mailbox => {
  return {
    id,
    remoteId,
    userId,
    email,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteMailboxToDbMailboxParams = (
  connectionId: string,
  customerId: string,
  remoteMailbox: RemoteMailbox
) => {
  return {
    id: uuidv5(remoteMailbox.id, connectionId),
    remote_id: remoteMailbox.id,
    customer_id: customerId,
    connection_id: connectionId,
    email: remoteMailbox.email,
    remote_created_at: remoteMailbox.createdAt?.toISOString(),
    remote_updated_at: remoteMailbox.updatedAt?.toISOString(),
    remote_was_deleted: remoteMailbox.isDeleted,
    last_modified_at: remoteMailbox.lastModifiedAt?.toISOString(),
    _remote_user_id: remoteMailbox.userId,
    user_id: remoteMailbox.userId ? uuidv5(remoteMailbox.userId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteMailbox.rawData,
  };
};
