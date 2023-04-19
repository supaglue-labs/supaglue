import { Event } from '@supaglue/types';

export const toSnakecasedKeysEvent = (event: Event) => {
  return {
    owner_id: event.ownerId,
    account_id: event.accountId,
    contact_id: event.contactId,
    lead_id: event.leadId,
    opportunity_id: event.opportunityId,
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
