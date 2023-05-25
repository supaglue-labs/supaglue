import { EngagementSequence } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { RemoteSequence, Sequence, SnakecasedKeysSequence, SnakecasedKeysSequenceV2 } from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysSequence = (sequence: Sequence): SnakecasedKeysSequence => {
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

export const toSnakecasedKeysSequenceV2 = (sequence: RemoteSequence): SnakecasedKeysSequenceV2 => {
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
  return {
    id: uuidv5(remoteSequence.id, connectionId),
    remote_id: remoteSequence.id,
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
    remote_created_at: remoteSequence.createdAt?.toISOString(),
    remote_updated_at: remoteSequence.updatedAt?.toISOString(),
    remote_was_deleted: remoteSequence.isDeleted,
    last_modified_at: remoteSequence.lastModifiedAt?.toISOString(),
    _remote_owner_id: remoteSequence.ownerId,
    owner_id: remoteSequence.ownerId ? uuidv5(remoteSequence.ownerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteSequence.rawData,
  };
};
