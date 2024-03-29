import type { Contact, SnakecasedKeysCrmContact } from '@supaglue/types/crm';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysCrmContact = (contact: Contact): SnakecasedKeysCrmContact => {
  return {
    owner_id: contact.ownerId,
    account_id: contact.accountId,
    last_modified_at: contact.lastModifiedAt,
    id: contact.id,
    first_name: contact.firstName,
    last_name: contact.lastName,
    addresses: contact.addresses.map(toSnakecasedKeysAddress),
    phone_numbers: contact.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    email_addresses: contact.emailAddresses.map(toSnakecasedKeysEmailAddress),
    last_activity_at: contact.lastActivityAt,
    lifecycle_stage: contact.lifecycleStage,
    created_at: contact.createdAt,
    updated_at: contact.updatedAt,
    is_deleted: contact.isDeleted,
    raw_data: contact.rawData,
  };
};
