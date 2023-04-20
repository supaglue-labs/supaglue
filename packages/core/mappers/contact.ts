import { Contact, SnakecasedKeysContact } from '@supaglue/types';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysContact = (contact: Contact): SnakecasedKeysContact => {
  return {
    owner_id: contact.ownerId,
    account_id: contact.accountId,
    last_modified_at: contact.lastModifiedAt,
    remote_id: contact.remoteId,
    first_name: contact.firstName,
    last_name: contact.lastName,
    addresses: contact.addresses.map(toSnakecasedKeysAddress),
    phone_numbers: contact.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    email_addresses: contact.emailAddresses.map(toSnakecasedKeysEmailAddress),
    last_activity_at: contact.lastActivityAt,
    lifecycle_stage: contact.lifecycleStage,
    remote_created_at: contact.remoteCreatedAt,
    remote_updated_at: contact.remoteUpdatedAt,
    remote_was_deleted: contact.remoteWasDeleted,
    remote_deleted_at: contact.remoteDeletedAt,
    detected_or_remote_deleted_at: contact.detectedOrRemoteDeletedAt,
  };
};
