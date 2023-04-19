import { Opportunity, OpportunityStatus } from '@supaglue/types';
import { CrmOpportunityModelExpanded } from '../types';
import { fromAccountModel, toSnakecasedKeysAccount } from './account';
import { fromUserModel, toSnakecasedKeysUser } from './user';

export const toSnakecasedKeysOpportunity = (opportunity: Opportunity) => {
  return {
    owner_id: opportunity.ownerId,
    owner: opportunity.owner ? toSnakecasedKeysUser(opportunity.owner) : undefined,
    account_id: opportunity.accountId,
    account: opportunity.account ? toSnakecasedKeysAccount(opportunity.account) : undefined,
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
  };
};

export const fromOpportunityModel = (
  {
    remoteId,
    ownerId,
    owner,
    name,
    description,
    stage,
    status,
    amount,
    lastActivityAt,
    pipeline,
    closeDate,
    accountId,
    account,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
  }: CrmOpportunityModelExpanded,
  expandedAssociations: string[] = []
): Opportunity => {
  const expandAccount = expandedAssociations.includes('account');
  const expandOwner = expandedAssociations.includes('owner');
  return {
    remoteId,
    ownerId,
    owner: expandOwner && owner ? fromUserModel(owner) : undefined,
    name,
    description,
    accountId,
    account: expandAccount && account ? fromAccountModel(account) : undefined,
    stage,
    lastActivityAt,
    closeDate,
    pipeline,
    status: status ? (status as OpportunityStatus) : null,
    amount,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
  };
};
