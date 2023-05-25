import type { CrmOpportunity } from '@supaglue/db';
import type { GetInternalParams } from '@supaglue/types';
import type {
  Opportunity,
  OpportunityStatus,
  RemoteOpportunity,
  SnakecasedKeysOpportunity,
  SnakecasedKeysOpportunityV2,
} from '@supaglue/types/crm';
import { v5 as uuidv5 } from 'uuid';

export const toSnakecasedKeysOpportunity = (opportunity: Opportunity): SnakecasedKeysOpportunity => {
  return {
    id: opportunity.id,
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
    raw_data: opportunity.rawData,
  };
};

export const toSnakecasedKeysCrmOpportunityV2 = (opportunity: RemoteOpportunity): SnakecasedKeysOpportunityV2 => {
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
    is_deleted: opportunity.isDeleted,
    raw_data: opportunity.rawData,
  };
};

export const fromOpportunityModel = (
  {
    id,
    remoteId,
    ownerId,
    name,
    description,
    stage,
    status,
    amount,
    lastActivityAt,
    pipeline,
    closeDate,
    accountId,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: CrmOpportunity,
  getParams?: GetInternalParams
): Opportunity => {
  return {
    id,
    remoteId,
    ownerId,
    name,
    description,
    accountId,
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
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteOpportunityToDbOpportunityParams = (
  connectionId: string,
  customerId: string,
  remoteOpportunity: RemoteOpportunity
) => {
  return {
    id: uuidv5(remoteOpportunity.id, connectionId),
    remote_id: remoteOpportunity.id,
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
    remote_created_at: remoteOpportunity.createdAt?.toISOString(),
    remote_updated_at: remoteOpportunity.updatedAt?.toISOString(),
    remote_was_deleted: remoteOpportunity.isDeleted,
    last_modified_at: remoteOpportunity.lastModifiedAt?.toISOString(),
    _remote_account_id: remoteOpportunity.accountId,
    account_id: remoteOpportunity.accountId ? uuidv5(remoteOpportunity.accountId, connectionId) : null,
    _remote_owner_id: remoteOpportunity.ownerId,
    owner_id: remoteOpportunity.ownerId ? uuidv5(remoteOpportunity.ownerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteOpportunity.rawData,
  };
};
