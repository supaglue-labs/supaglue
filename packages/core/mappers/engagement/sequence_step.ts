import type { SequenceStep, SnakecasedKeysSequenceStep } from '@supaglue/types/engagement';

export const toSnakecasedKeysSequenceStep = (sequenceStep: SequenceStep): SnakecasedKeysSequenceStep => {
  return {
    sequence_id: sequenceStep.sequenceId,
    last_modified_at: sequenceStep.lastModifiedAt,
    id: sequenceStep.id,
    name: sequenceStep.name,
    created_at: sequenceStep.createdAt,
    updated_at: sequenceStep.updatedAt,
    is_deleted: sequenceStep.isDeleted,
    raw_data: sequenceStep.rawData,
  };
};
