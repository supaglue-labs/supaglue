import { Event, RemoteEvent } from '@supaglue/types';
import { v4 as uuidv4 } from 'uuid';
import { fromAccountModel, fromContactModel, fromLeadModel, fromOpportunityModel, fromUserModel } from '.';
import { CrmEventExpanded } from '../types';

export const fromEventModel = (
  {
    id,
    remoteId,
    ownerId,
    owner,
    subject,
    content,
    startTime,
    endTime,
    type,
    accountId,
    account,
    contactId,
    contact,
    leadId,
    lead,
    opportunityId,
    opportunity,
    lastModifiedAt,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
  }: CrmEventExpanded,
  expandedAssociations: string[] = []
): Event => {
  const expandAccount = expandedAssociations.includes('account');
  const expandContact = expandedAssociations.includes('contact');
  const expandOwner = expandedAssociations.includes('owner');
  const expandLead = expandedAssociations.includes('lead');
  const expandOpportunity = expandedAssociations.includes('opportunity');
  return {
    id,
    remoteId,
    ownerId,
    owner: expandOwner && owner ? fromUserModel(owner) : undefined,
    subject,
    content,
    startTime,
    endTime,
    type,
    accountId,
    contactId,
    leadId,
    opportunityId,
    account: expandAccount && account ? fromAccountModel(account) : undefined,
    contact: expandContact && contact ? fromContactModel(contact) : undefined,
    lead: expandLead && lead ? fromLeadModel(lead) : undefined,
    opportunity: expandOpportunity && opportunity ? fromOpportunityModel(opportunity) : undefined,
    lastModifiedAt,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteEventToDbEventParams = (connectionId: string, customerId: string, remoteEvent: RemoteEvent) => {
  const lastModifiedAt =
    remoteEvent.remoteUpdatedAt || remoteEvent.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(remoteEvent.remoteUpdatedAt?.getTime() || 0, remoteEvent.detectedOrRemoteDeletedAt?.getTime() || 0)
        )
      : undefined;

  return {
    id: uuidv4(),
    remote_id: remoteEvent.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    subject: remoteEvent.subject,
    content: remoteEvent.content,
    type: remoteEvent.type,
    start_time: remoteEvent.startTime?.toISOString(),
    end_time: remoteEvent.endTime?.toISOString(),
    remote_created_at: remoteEvent.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteEvent.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteEvent.remoteWasDeleted,
    remote_deleted_at: remoteEvent.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteEvent.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    _remote_account_id: remoteEvent.remoteAccountId,
    _remote_contact_id: remoteEvent.remoteContactId,
    _remote_lead_id: remoteEvent.remoteLeadId,
    _remote_opportunity_id: remoteEvent.remoteOpportunityId,
    _remote_owner_id: remoteEvent.remoteOwnerId,
    updated_at: new Date().toISOString(),
  };
};
