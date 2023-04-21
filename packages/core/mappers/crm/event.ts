import { Event, SnakecasedKeysEvent } from '@supaglue/types/crm';

export const toSnakecasedKeysEvent = (event: Event): SnakecasedKeysEvent => {
  return {
    owner_id: event.ownerId,
    account_id: event.accountId,
    contact_id: event.contactId,
    lead_id: event.leadId,
    opportunity_id: event.opportunityId,
    last_modified_at: event.lastModifiedAt,
    id: event.id,
    type: event.type,
    subject: event.subject,
    content: event.content,
    start_time: event.startTime,
    end_time: event.endTime,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
    was_deleted: event.wasDeleted,
    deleted_at: event.deletedAt,
  };
};
