import type { Sequence, SnakecasedKeysSequence } from '@supaglue/types/engagement';

export const toSnakecasedKeysSequence = (sequence: Sequence): SnakecasedKeysSequence => {
  return {
    owner_id: sequence.ownerId,
    last_modified_at: sequence.lastModifiedAt,
    id: sequence.id,
    is_enabled: sequence.isEnabled,
    name: sequence.name,
    tags: sequence.tags,
    num_steps: sequence.numSteps,
    metrics: sequence.metrics,
    created_at: sequence.createdAt,
    updated_at: sequence.updatedAt,
    is_deleted: sequence.isDeleted,
    raw_data: sequence.rawData,
    is_archived: sequence.isArchived,
    share_type: sequence.shareType,
  };
};
