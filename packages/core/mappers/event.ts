import { Event } from '@supaglue/types';
import {
  fromAccountModel,
  fromContactModel,
  fromLeadModel,
  fromOpportunityModel,
  fromUserModel,
  toSnakecasedKeysAccount,
  toSnakecasedKeysContact,
  toSnakecasedKeysLead,
  toSnakecasedKeysOpportunity,
  toSnakecasedKeysUser,
} from '.';
import { CrmEventModelExpanded } from '../types';

export const toSnakecasedKeysEvent = (event: Event) => {
  return {
    owner_id: event.ownerId,
    owner: event.owner ? toSnakecasedKeysUser(event.owner) : undefined,
    account_id: event.accountId,
    account: event.account ? toSnakecasedKeysAccount(event.account) : undefined,
    contact_id: event.contactId,
    contact: event.contact ? toSnakecasedKeysContact(event.contact) : undefined,
    lead_id: event.leadId,
    lead: event.lead ? toSnakecasedKeysLead(event.lead) : undefined,
    opportunity_id: event.opportunityId,
    opportunity: event.opportunity ? toSnakecasedKeysOpportunity(event.opportunity) : undefined,
    last_modified_at: event.lastModifiedAt,
    remote_id: event.remoteId,
    type: event.type,
    subject: event.subject,
    content: event.content,
    start_time: event.startTime,
    end_time: event.endTime,
    remote_created_at: event.remoteCreatedAt,
    remote_updated_at: event.remoteUpdatedAt,
    remote_was_deleted: event.remoteWasDeleted,
  };
};

export const fromEventModel = (
  {
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
  }: CrmEventModelExpanded,
  expandedAssociations: string[] = []
): Event => {
  const expandAccount = expandedAssociations.includes('account');
  const expandContact = expandedAssociations.includes('contact');
  const expandOwner = expandedAssociations.includes('owner');
  const expandLead = expandedAssociations.includes('lead');
  const expandOpportunity = expandedAssociations.includes('opportunity');
  return {
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
