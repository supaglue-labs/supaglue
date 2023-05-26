import type { CrmLead, Prisma } from '@supaglue/db';
import type { GetInternalParams } from '@supaglue/types';
import type { Lead, LeadV2, SnakecasedKeysCrmLead, SnakecasedKeysCrmLeadV2 } from '@supaglue/types/crm';
import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import { v5 as uuidv5 } from 'uuid';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysLead = (lead: Lead): SnakecasedKeysCrmLead => {
  return {
    id: lead.id,
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
    raw_data: lead.rawData,
  };
};

export const toSnakecasedKeysCrmLeadV2 = (lead: LeadV2): SnakecasedKeysCrmLeadV2 => {
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

export const fromRemoteLeadToModel = (
  connectionId: string,
  customerId: string,
  remoteLead: LeadV2
): Prisma.CrmLeadCreateInput => {
  return {
    id: uuidv5(remoteLead.id, connectionId),
    remoteId: remoteLead.id,
    customerId,
    connectionId,
    leadSource: remoteLead.leadSource,
    title: remoteLead.title,
    company: remoteLead.company,
    firstName: remoteLead.firstName,
    lastName: remoteLead.lastName,
    addresses: remoteLead.addresses,
    phoneNumbers: remoteLead.phoneNumbers,
    emailAddresses: remoteLead.emailAddresses,
    remoteCreatedAt: remoteLead.createdAt?.toISOString(),
    remoteUpdatedAt: remoteLead.updatedAt?.toISOString(),
    remoteWasDeleted: remoteLead.isDeleted,
    lastModifiedAt: remoteLead.lastModifiedAt?.toISOString(),
    convertedDate: remoteLead.convertedDate?.toISOString(),
    convertedRemoteAccountId: remoteLead.convertedAccountId,
    convertedAccountId: remoteLead.convertedAccountId ? uuidv5(remoteLead.convertedAccountId, connectionId) : null,
    convertedRemoteContactId: remoteLead.convertedContactId,
    convertedContactId: remoteLead.convertedContactId ? uuidv5(remoteLead.convertedContactId, connectionId) : null,
    remoteOwnerId: remoteLead.ownerId,
    ownerId: remoteLead.ownerId ? uuidv5(remoteLead.ownerId, connectionId) : null,
    rawData: remoteLead.rawData,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteLeadToDbLeadParams = (connectionId: string, customerId: string, remoteLead: LeadV2) => {
  return {
    id: uuidv5(remoteLead.id, connectionId),
    remote_id: remoteLead.id,
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
    remote_created_at: remoteLead.createdAt?.toISOString(),
    remote_updated_at: remoteLead.updatedAt?.toISOString(),
    remote_was_deleted: remoteLead.isDeleted,
    last_modified_at: remoteLead.lastModifiedAt?.toISOString(),
    converted_date: remoteLead.convertedDate?.toISOString(),
    _converted_remote_account_id: remoteLead.convertedAccountId,
    converted_account_id: remoteLead.convertedAccountId ? uuidv5(remoteLead.convertedAccountId, connectionId) : null,
    _converted_remote_contact_id: remoteLead.convertedContactId,
    converted_contact_id: remoteLead.convertedContactId ? uuidv5(remoteLead.convertedContactId, connectionId) : null,
    _remote_owner_id: remoteLead.ownerId,
    owner_id: remoteLead.ownerId ? uuidv5(remoteLead.ownerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteLead.rawData,
  };
};
