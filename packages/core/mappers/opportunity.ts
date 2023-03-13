import { v4 as uuidv4 } from 'uuid';
import { CrmOpportunityExpanded, Opportunity, OpportunityStatus, RemoteOpportunity } from '../types';
import { fromAccountModel } from './account';

export const fromOpportunityModel = (
  {
    id,
    remoteWasDeleted,
    ownerId,
    name,
    description,
    stage,
    status,
    amount,
    lastActivityAt,
    closeDate,
    accountId,
    account,
    remoteCreatedAt,
    remoteUpdatedAt,
  }: CrmOpportunityExpanded,
  expandedAssociations: string[] = []
): Opportunity => {
  const expandAccount = expandedAssociations.includes('account');
  return {
    id,
    ownerId,
    name,
    description,
    accountId,
    account: expandAccount && account ? fromAccountModel(account) : undefined,
    stage,
    lastActivityAt,
    closeDate,
    status: status ? (status as OpportunityStatus) : null,
    amount,
    wasDeleted: remoteWasDeleted,
    createdAt: remoteCreatedAt,
    updatedAt: remoteUpdatedAt,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteOpportunityToDbOpportunityParams = (
  connectionId: string,
  customerId: string,
  remoteOpportunity: RemoteOpportunity
) => {
  return {
    id: uuidv4(),
    remote_id: remoteOpportunity.remoteId,
    connection_id: connectionId,
    customer_id: customerId,
    remote_was_deleted: remoteOpportunity.remoteWasDeleted,
    name: remoteOpportunity.name,
    description: remoteOpportunity.description,
    amount: remoteOpportunity.amount,
    stage: remoteOpportunity.stage,
    status: remoteOpportunity.status,
    last_activity_at: remoteOpportunity.lastActivityAt?.toISOString(),
    close_date: remoteOpportunity.closeDate?.toISOString(),
    remote_created_at: remoteOpportunity.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteOpportunity.remoteUpdatedAt?.toISOString(),
    _remote_account_id: remoteOpportunity.remoteAccountId,
    _remote_owner_id: remoteOpportunity.remoteOwnerId,
    updated_at: new Date().toISOString(),
  };
};
