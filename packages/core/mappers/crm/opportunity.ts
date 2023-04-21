import { Opportunity, SnakecasedKeysOpportunity } from '@supaglue/types/crm';

export const toSnakecasedKeysOpportunity = (opportunity: Opportunity): SnakecasedKeysOpportunity => {
  return {
    owner_id: opportunity.ownerId,
    account_id: opportunity.accountId,
    last_modified_at: opportunity.lastModifiedAt,
    id: opportunity.id,
    name: opportunity.name,
    description: opportunity.description,
    amount: opportunity.amount,
    stage: opportunity.stage,
    status: opportunity.status,
    last_activity_at: opportunity.lastActivityAt,
    close_date: opportunity.closeDate,
    pipeline: opportunity.pipeline,
    created_at: opportunity.createdAt,
    updated_at: opportunity.updatedAt,
    was_deleted: opportunity.wasDeleted,
    deleted_at: opportunity.deletedAt,
  };
};
