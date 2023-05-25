import { EngagementSequenceState } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import {
  RemoteSequenceState,
  SequenceState,
  SnakecasedKeysSequenceState,
  SnakecasedKeysSequenceStateV2,
} from '@supaglue/types/engagement';
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

export const toSnakecasedKeysSequenceStateV2 = (sequenceState: RemoteSequenceState): SnakecasedKeysSequenceStateV2 => {
  return {
    contact_id: sequenceState.contactId,
    sequence_id: sequenceState.sequenceId,
    mailbox_id: sequenceState.mailboxId,
    last_modified_at: sequenceState.lastModifiedAt,
    id: sequenceState.id,
    state: sequenceState.state,
    created_at: sequenceState.createdAt,
    updated_at: sequenceState.updatedAt,
    is_deleted: sequenceState.isDeleted,
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
  return {
    id: uuidv5(remoteSequenceState.id, connectionId),
    remote_id: remoteSequenceState.id,
    customer_id: customerId,
    connection_id: connectionId,
    state: remoteSequenceState.state,
    remote_created_at: remoteSequenceState.createdAt?.toISOString(),
    remote_updated_at: remoteSequenceState.updatedAt?.toISOString(),
    remote_was_deleted: remoteSequenceState.isDeleted,
    last_modified_at: remoteSequenceState.lastModifiedAt?.toISOString(),
    _remote_contact_id: remoteSequenceState.contactId,
    contact_id: remoteSequenceState.contactId ? uuidv5(remoteSequenceState.contactId, connectionId) : null,
    _remote_sequence_id: remoteSequenceState.sequenceId,
    sequence_id: remoteSequenceState.sequenceId ? uuidv5(remoteSequenceState.sequenceId, connectionId) : null,
    _remote_mailbox_id: remoteSequenceState.mailboxId,
    mailbox_id: remoteSequenceState.mailboxId ? uuidv5(remoteSequenceState.mailboxId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteSequenceState.rawData,
  };
};
