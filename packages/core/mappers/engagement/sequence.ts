import { EngagementSequence } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { RemoteSequence, Sequence } from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysSequence = (sequence: Sequence) => {
  return {
    id: sequence.id,
    owner_id: sequence.ownerId,
    last_modified_at: sequence.lastModifiedAt,
    remote_id: sequence.remoteId,
    is_enabled: sequence.isEnabled,
    name: sequence.name,
    tags: sequence.tags,
    num_steps: sequence.numSteps,
    schedule_count: sequence.scheduleCount,
    open_count: sequence.openCount,
    opt_out_count: sequence.optOutCount,
    reply_count: sequence.replyCount,
    click_count: sequence.clickCount,
    remote_created_at: sequence.remoteCreatedAt,
    remote_updated_at: sequence.remoteUpdatedAt,
    remote_was_deleted: sequence.remoteWasDeleted,
    raw_data: sequence.rawData,
  };
};

type TagsModel = {
  tags: string[];
};

export const fromSequenceModel = (
  {
    id,
    remoteId,
    ownerId,
    isEnabled,
    name,
    tags,
    numSteps,
    scheduleCount,
    openCount,
    optOutCount,
    replyCount,
    clickCount,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: EngagementSequence,
  getParams?: GetInternalParams
): Sequence => {
  return {
    id,
    remoteId,
    ownerId,
    isEnabled,
    name,
    tags: (tags as TagsModel).tags,
    numSteps,
    scheduleCount,
    openCount,
    optOutCount,
    replyCount,
    clickCount,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteSequenceToDbSequenceParams = (
  connectionId: string,
  customerId: string,
  remoteSequence: RemoteSequence
) => {
  const lastModifiedAt =
    remoteSequence.remoteUpdatedAt || remoteSequence.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(
            remoteSequence.remoteUpdatedAt?.getTime() || 0,
            remoteSequence.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
      : undefined;

  return {
    id: uuidv5(remoteSequence.remoteId, connectionId),
    remote_id: remoteSequence.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    name: remoteSequence.name,
    is_enabled: remoteSequence.isEnabled,
    // We wrap it as an object so it's CSV-friendly
    tags: { tags: remoteSequence.tags },
    num_steps: remoteSequence.numSteps,
    schedule_count: remoteSequence.scheduleCount,
    open_count: remoteSequence.openCount,
    opt_out_count: remoteSequence.optOutCount,
    click_count: remoteSequence.clickCount,
    reply_count: remoteSequence.replyCount,
    remote_created_at: remoteSequence.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteSequence.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteSequence.remoteWasDeleted,
    remote_deleted_at: remoteSequence.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteSequence.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    _remote_owner_id: remoteSequence.remoteOwnerId,
    owner_id: remoteSequence.remoteOwnerId ? uuidv5(remoteSequence.remoteOwnerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteSequence.rawData,
  };
};
