import { EngagementContact } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import {
  Address,
  Contact,
  EmailAddress,
  PhoneNumber,
  RemoteContact,
  SnakecasedKeysEngagementContact,
  SnakecasedKeysEngagementContactV2,
} from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';
import { toSnakecasedKeysAddress, toSnakecasedKeysEmailAddress, toSnakecasedKeysPhoneNumber } from '.';

export const toSnakecasedKeysEngagementContact = (contact: Contact): SnakecasedKeysEngagementContact => {
  return {
    id: contact.id,
    owner_id: contact.ownerId,
    last_modified_at: contact.lastModifiedAt,
    remote_id: contact.remoteId,
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
    remote_created_at: contact.remoteCreatedAt,
    remote_updated_at: contact.remoteUpdatedAt,
    remote_was_deleted: contact.remoteWasDeleted,
    raw_data: contact.rawData,
  };
};

export const toSnakecasedKeysEngagementContactV2 = (contact: RemoteContact): SnakecasedKeysEngagementContactV2 => {
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

export const fromContactModel = (
  {
    id,
    remoteId,
    ownerId,
    firstName,
    lastName,
    address,
    jobTitle,
    openCount,
    clickCount,
    replyCount,
    bouncedCount,
    emailAddresses,
    phoneNumbers,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: EngagementContact,
  getParams?: GetInternalParams
): Contact => {
  return {
    id,
    remoteId,
    ownerId,
    firstName,
    lastName,
    jobTitle,
    openCount,
    clickCount,
    replyCount,
    bouncedCount,
    address: address as Address | null,
    emailAddresses: emailAddresses as EmailAddress[],
    phoneNumbers: phoneNumbers as PhoneNumber[],
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteContactToDbContactParams = (
  connectionId: string,
  customerId: string,
  remoteContact: RemoteContact
) => {
  return {
    id: uuidv5(remoteContact.id, connectionId),
    remote_id: remoteContact.id,
    customer_id: customerId,
    connection_id: connectionId,
    first_name: remoteContact.firstName,
    last_name: remoteContact.lastName,
    job_title: remoteContact.jobTitle,
    address: remoteContact.address,
    email_addresses: remoteContact.emailAddresses,
    phone_numbers: remoteContact.phoneNumbers,
    open_count: remoteContact.openCount,
    click_count: remoteContact.clickCount,
    reply_count: remoteContact.replyCount,
    bounced_count: remoteContact.bouncedCount,
    remote_created_at: remoteContact.createdAt?.toISOString(),
    remote_updated_at: remoteContact.updatedAt?.toISOString(),
    remote_was_deleted: remoteContact.isDeleted,
    last_modified_at: remoteContact.lastModifiedAt?.toISOString(),
    _remote_owner_id: remoteContact.ownerId,
    owner_id: remoteContact.ownerId ? uuidv5(remoteContact.ownerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteContact.rawData,
  };
};
