import { Opportunity, OpportunityStatus, RemoteOpportunity } from '@supaglue/types';
import { v4 as uuidv4 } from 'uuid';
import { CrmOpportunityExpanded } from '../types';
import { fromAccountModel, toSnakecasedKeysAccount } from './account';
import { fromUserModel, toSnakecasedKeysUser } from './user';

export const toSnakecasedKeysOpportunity = (opportunity: Opportunity) => {
  return {
    id: opportunity.id,
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
    id,
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
  }: CrmOpportunityExpanded,
  expandedAssociations: string[] = []
): Opportunity => {
  const expandAccount = expandedAssociations.includes('account');
  const expandOwner = expandedAssociations.includes('owner');
  return {
    id,
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

// TODO: Use prisma generator to generate return type
export const fromRemoteOpportunityToDbOpportunityParams = (
  connectionId: string,
  customerId: string,
  remoteOpportunity: RemoteOpportunity
) => {
  const lastModifiedAt =
    remoteOpportunity.remoteUpdatedAt || remoteOpportunity.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(
            remoteOpportunity.remoteUpdatedAt?.getTime() || 0,
            remoteOpportunity.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
      : undefined;

  return {
    id: uuidv4(),
    remote_id: remoteOpportunity.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    name: remoteOpportunity.name,
    description: remoteOpportunity.description,
    amount: remoteOpportunity.amount,
    stage: remoteOpportunity.stage,
    status: remoteOpportunity.status,
    pipeline: remoteOpportunity.pipeline,
    last_activity_at: remoteOpportunity.lastActivityAt?.toISOString(),
    close_date: remoteOpportunity.closeDate?.toISOString(),
    remote_created_at: remoteOpportunity.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteOpportunity.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteOpportunity.remoteWasDeleted,
    remote_deleted_at: remoteOpportunity.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteOpportunity.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    _remote_account_id: remoteOpportunity.remoteAccountId,
    _remote_owner_id: remoteOpportunity.remoteOwnerId,
    updated_at: new Date().toISOString(),
  };
};
