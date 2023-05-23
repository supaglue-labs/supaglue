import { EngagementSequenceState } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { RemoteSequenceState, SequenceState, SnakecasedKeysSequenceState } from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysSequenceState = (sequenceState: SequenceState): SnakecasedKeysSequenceState => {
  return {
    id: sequenceState.id,
    contact_id: sequenceState.contactId,
    sequence_id: sequenceState.sequenceId,
    mailbox_id: sequenceState.mailboxId,
    last_modified_at: sequenceState.lastModifiedAt,
    remote_id: sequenceState.remoteId,
    state: sequenceState.state,
    remote_created_at: sequenceState.remoteCreatedAt,
    remote_updated_at: sequenceState.remoteUpdatedAt,
    remote_was_deleted: sequenceState.remoteWasDeleted,
    raw_data: sequenceState.rawData,
  };
};

export const fromSequenceStateModel = (
  {
    id,
    remoteId,
    state,
    contactId,
    sequenceId,
    mailboxId,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: EngagementSequenceState,
  getParams?: GetInternalParams
): SequenceState => {
  return {
    id,
    remoteId,
    contactId,
    state,
    sequenceId,
    mailboxId,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteSequenceStateToDbSequenceStateParams = (
  connectionId: string,
  customerId: string,
  remoteSequenceState: RemoteSequenceState
) => {
  const lastModifiedAt =
    remoteSequenceState.remoteUpdatedAt || remoteSequenceState.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(
            remoteSequenceState.remoteUpdatedAt?.getTime() || 0,
            remoteSequenceState.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
      : undefined;

  return {
    id: uuidv5(remoteSequenceState.remoteId, connectionId),
    remote_id: remoteSequenceState.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    state: remoteSequenceState.state,
    remote_created_at: remoteSequenceState.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteSequenceState.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteSequenceState.remoteWasDeleted,
    remote_deleted_at: remoteSequenceState.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteSequenceState.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    _remote_contact_id: remoteSequenceState.remoteContactId,
    contact_id: remoteSequenceState.remoteContactId ? uuidv5(remoteSequenceState.remoteContactId, connectionId) : null,
    _remote_sequence_id: remoteSequenceState.remoteSequenceId,
    sequence_id: remoteSequenceState.remoteSequenceId
      ? uuidv5(remoteSequenceState.remoteSequenceId, connectionId)
      : null,
    _remote_mailbox_id: remoteSequenceState.remoteMailboxId,
    mailbox_id: remoteSequenceState.remoteMailboxId ? uuidv5(remoteSequenceState.remoteMailboxId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteSequenceState.rawData,
  };
};
