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
    schedule_count: sequence.scheduleCount,
    open_count: sequence.openCount,
    opt_out_count: sequence.optOutCount,
    reply_count: sequence.replyCount,
    click_count: sequence.clickCount,
    created_at: sequence.createdAt,
    updated_at: sequence.updatedAt,
    is_deleted: sequence.isDeleted,
    raw_data: sequence.rawData,
  };
};
