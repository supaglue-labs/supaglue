import { CrmOpportunityExpanded, Opportunity, OpportunityStatus } from '../types';
import { fromAccountModel } from './account';

export const fromOpportunityModel = (
  {
    id,
    remoteWasDeleted,
    owner,
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
    owner,
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
