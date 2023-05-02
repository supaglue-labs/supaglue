import { CrmLead } from '@supaglue/db';
import { Address, EmailAddress, GetInternalParams, Lead, PhoneNumber, RemoteLead } from '@supaglue/types';
import { v5 as uuidv5 } from 'uuid';
import { toSnakecasedKeysAccount, toSnakecasedKeysContact, toSnakecasedKeysUser } from '.';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysLead = (lead: Lead) => {
  return {
    id: lead.id,
    owner_id: lead.ownerId,
    owner: lead.owner ? toSnakecasedKeysUser(lead.owner) : undefined,
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
    converted_contact: lead.convertedContact ? toSnakecasedKeysContact(lead.convertedContact) : undefined,
    converted_account_id: lead.convertedAccountId,
    converted_account: lead.convertedAccount ? toSnakecasedKeysAccount(lead.convertedAccount) : undefined,
    raw_data: lead.rawData,
  };
};

export const fromLeadModel = (
  {
    id,
    remoteId,
    ownerId,
    leadSource,
    title,
    company,
    firstName,
    lastName,
    addresses,
    phoneNumbers,
    emailAddresses,
    convertedDate,
    convertedAccountId,
    convertedContactId,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: CrmLead,
  getParams?: GetInternalParams
): Lead => {
  return {
    id,
    remoteId,
    ownerId,
    leadSource,
    title,
    company,
    firstName,
    lastName,
    addresses: addresses as Address[],
    phoneNumbers: phoneNumbers as PhoneNumber[],
    emailAddresses: emailAddresses as EmailAddress[],
    convertedDate,
    convertedAccountId,
    convertedContactId,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteLeadToDbLeadParams = (connectionId: string, customerId: string, remoteLead: RemoteLead) => {
  const lastModifiedAt =
    remoteLead.remoteUpdatedAt || remoteLead.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(remoteLead.remoteUpdatedAt?.getTime() || 0, remoteLead.detectedOrRemoteDeletedAt?.getTime() || 0)
        )
      : undefined;

  return {
    id: uuidv5(remoteLead.remoteId, connectionId),
    remote_id: remoteLead.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    lead_source: remoteLead.leadSource,
    title: remoteLead.title,
    company: remoteLead.company,
    first_name: remoteLead.firstName,
    last_name: remoteLead.lastName,
    addresses: remoteLead.addresses,
    phone_numbers: remoteLead.phoneNumbers,
    email_addresses: remoteLead.emailAddresses,
    remote_created_at: remoteLead.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteLead.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteLead.remoteWasDeleted,
    remote_deleted_at: remoteLead.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteLead.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    converted_date: remoteLead.convertedDate?.toISOString(),
    _converted_remote_account_id: remoteLead.convertedRemoteAccountId,
    converted_account_id: remoteLead.convertedRemoteAccountId
      ? uuidv5(remoteLead.convertedRemoteAccountId, connectionId)
      : null,
    _converted_remote_contact_id: remoteLead.convertedRemoteContactId,
    converted_contact_id: remoteLead.convertedRemoteContactId
      ? uuidv5(remoteLead.convertedRemoteContactId, connectionId)
      : null,
    _remote_owner_id: remoteLead.remoteOwnerId,
    owner_id: remoteLead.remoteOwnerId ? uuidv5(remoteLead.remoteOwnerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteLead.rawData,
  };
};
