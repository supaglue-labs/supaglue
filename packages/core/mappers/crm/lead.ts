import type { Lead, SnakecasedKeysCrmLead } from '@supaglue/types/crm';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysCrmLead = (lead: Lead): SnakecasedKeysCrmLead => {
  return {
    owner_id: lead.ownerId,
    last_modified_at: lead.lastModifiedAt,
    id: lead.id,
    lead_source: lead.leadSource,
    title: lead.title,
    company: lead.company,
    first_name: lead.firstName,
    last_name: lead.lastName,
    addresses: lead.addresses.map(toSnakecasedKeysAddress),
    email_addresses: lead.emailAddresses.map(toSnakecasedKeysEmailAddress),
    phone_numbers: lead.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    converted_date: lead.convertedDate,
    updated_at: lead.updatedAt,
    created_at: lead.createdAt,
    is_deleted: lead.isDeleted,
    converted_contact_id: lead.convertedContactId,
    converted_account_id: lead.convertedAccountId,
    raw_data: lead.rawData,
  };
};
