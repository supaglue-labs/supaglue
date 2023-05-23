import { EngagementMailbox } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { Mailbox, RemoteMailbox, SnakecasedKeysMailbox, SnakecasedKeysSimpleMailbox } from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';
import { getLastModifiedAt } from '../../services';

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

export const toSnakecasedKeysSimpleMailbox = (mailbox: RemoteMailbox): SnakecasedKeysSimpleMailbox => {
  return {
    remote_user_id: mailbox.remoteUserId,
    last_modified_at: getLastModifiedAt(mailbox),
    remote_id: mailbox.remoteId,
    email: mailbox.email,
    remote_created_at: mailbox.remoteCreatedAt,
    remote_updated_at: mailbox.remoteUpdatedAt,
    remote_was_deleted: mailbox.remoteWasDeleted,
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
  const lastModifiedAt =
    remoteMailbox.remoteUpdatedAt || remoteMailbox.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(
            remoteMailbox.remoteUpdatedAt?.getTime() || 0,
            remoteMailbox.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
      : undefined;

  return {
    id: uuidv5(remoteMailbox.remoteId, connectionId),
    remote_id: remoteMailbox.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    email: remoteMailbox.email,
    remote_created_at: remoteMailbox.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteMailbox.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteMailbox.remoteWasDeleted,
    remote_deleted_at: remoteMailbox.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteMailbox.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    _remote_user_id: remoteMailbox.remoteUserId,
    user_id: remoteMailbox.remoteUserId ? uuidv5(remoteMailbox.remoteUserId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteMailbox.rawData,
  };
};
