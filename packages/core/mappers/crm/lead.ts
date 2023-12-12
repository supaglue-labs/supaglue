import type { Lead, SnakecasedKeysCrmLead } from '@supaglue/types/crm';
import { toSnakecasedKeysCrmAccount } from './account';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysCrmContact } from './contact';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';
import { toSnakecasedKeysCrmUser } from './user';

export const toSnakecasedKeysCrmLead = (lead: Lead): SnakecasedKeysCrmLead => {
  return {
    owner_id: lead.ownerId,
    owner: lead.owner ? toSnakecasedKeysCrmUser(lead.owner) : undefined,
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
    converted_contact: lead.convertedContact ? toSnakecasedKeysCrmContact(lead.convertedContact) : undefined,
    converted_account_id: lead.convertedAccountId,
    converted_account: lead.convertedAccount ? toSnakecasedKeysCrmAccount(lead.convertedAccount) : undefined,
    raw_data: lead.rawData,
  };
};
