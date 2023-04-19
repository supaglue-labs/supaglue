import { Lead } from '@supaglue/types';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysLead = (lead: Lead) => {
  return {
    owner_id: lead.ownerId,
    last_modified_at: lead.lastModifiedAt,
    remote_id: lead.remoteId,
    lead_source: lead.leadSource,
    title: lead.title,
    company: lead.company,
    first_name: lead.firstName,
    last_name: lead.lastName,
    addresses: lead.addresses.map(toSnakecasedKeysAddress),
    email_addresses: lead.emailAddresses.map(toSnakecasedKeysEmailAddress),
    phone_numbers: lead.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    converted_date: lead.convertedDate,
    remote_updated_at: lead.remoteUpdatedAt,
    remote_created_at: lead.remoteCreatedAt,
    remote_was_deleted: lead.remoteWasDeleted,
    converted_contact_id: lead.convertedContactId,
    converted_account_id: lead.convertedAccountId,
  };
};
