import type { Opportunity, SnakecasedKeysCrmOpportunity } from '@supaglue/types/crm';
import { toSnakecasedKeysCrmAccount } from './account';
import { toSnakecasedKeysCrmUser } from './user';

export const toSnakecasedKeysCrmOpportunity = (opportunity: Opportunity): SnakecasedKeysCrmOpportunity => {
  return {
    owner_id: opportunity.ownerId,
    owner: opportunity.owner ? toSnakecasedKeysCrmUser(opportunity.owner) : undefined,
    account_id: opportunity.accountId,
    account: opportunity.account ? toSnakecasedKeysCrmAccount(opportunity.account) : undefined,
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
    is_deleted: opportunity.isDeleted,
    raw_data: opportunity.rawData,
  };
};
