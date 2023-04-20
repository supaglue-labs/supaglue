import { Opportunity, SnakecasedKeysOpportunity } from '@supaglue/types';

export const toSnakecasedKeysOpportunity = (opportunity: Opportunity): SnakecasedKeysOpportunity => {
  return {
    owner_id: opportunity.ownerId,
    account_id: opportunity.accountId,
    last_modified_at: opportunity.lastModifiedAt,
    remote_id: opportunity.remoteId,
    name: opportunity.name,
    description: opportunity.description,
    amount: opportunity.amount,
    stage: opportunity.stage,
    status: opportunity.status,
    last_activity_at: opportunity.lastActivityAt,
    close_date: opportunity.closeDate,
    pipeline: opportunity.pipeline,
    remote_created_at: opportunity.remoteCreatedAt,
    remote_updated_at: opportunity.remoteUpdatedAt,
    remote_was_deleted: opportunity.remoteWasDeleted,
    remote_deleted_at: opportunity.remoteDeletedAt,
    detected_or_remote_deleted_at: opportunity.detectedOrRemoteDeletedAt,
  };
};
