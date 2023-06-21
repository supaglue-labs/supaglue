import type { SequenceState, SnakecasedKeysSequenceState } from '@supaglue/types/engagement';

export const toSnakecasedKeysSequenceStateV2 = (sequenceState: SequenceState): SnakecasedKeysSequenceState => {
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
