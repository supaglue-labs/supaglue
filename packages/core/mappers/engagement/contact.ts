import type { Contact, SnakecasedKeysEngagementContact } from '@supaglue/types/engagement';
import { toSnakecasedKeysAddress, toSnakecasedKeysEmailAddress, toSnakecasedKeysPhoneNumber } from '.';

export const toSnakecasedKeysEngagementContact = (contact: Contact): SnakecasedKeysEngagementContact => {
  return {
    owner_id: contact.ownerId,
    last_modified_at: contact.lastModifiedAt,
    id: contact.id,
    first_name: contact.firstName,
    last_name: contact.lastName,
    job_title: contact.jobTitle,
    address: contact.address ? toSnakecasedKeysAddress(contact.address) : null,
    phone_numbers: contact.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    email_addresses: contact.emailAddresses.map(toSnakecasedKeysEmailAddress),
    open_count: contact.openCount,
    click_count: contact.clickCount,
    reply_count: contact.openCount,
    bounced_count: contact.bouncedCount,
    created_at: contact.createdAt,
    updated_at: contact.updatedAt,
    is_deleted: contact.isDeleted,
    raw_data: contact.rawData,
  };
};
