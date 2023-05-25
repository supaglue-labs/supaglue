import { CrmContact, Prisma } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { Contact, RemoteContact, SnakecasedKeysCrmContact, SnakecasedKeysCrmContactV2 } from '@supaglue/types/crm';
import { Address, EmailAddress, LifecycleStage, PhoneNumber } from '@supaglue/types/crm/common';
import { v5 as uuidv5 } from 'uuid';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysCrmContact = (contact: Contact): SnakecasedKeysCrmContact => {
  return {
    id: contact.id,
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
    raw_data: contact.rawData,
  };
};

export const toSnakecasedKeysCrmContactV2 = (contact: RemoteContact): SnakecasedKeysCrmContactV2 => {
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

export const fromContactModel = (
  {
    id,
    remoteId,
    ownerId,
    accountId,
    firstName,
    lastName,
    addresses,
    emailAddresses,
    phoneNumbers,
    lifecycleStage,
    lastActivityAt,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData,
  }: CrmContact,
  getParams?: GetInternalParams
): Contact => {
  return {
    id,
    remoteId,
    ownerId,
    accountId,
    firstName,
    lastName,
    addresses: addresses as Address[],
    emailAddresses: emailAddresses as EmailAddress[],
    phoneNumbers: phoneNumbers as PhoneNumber[],
    lifecycleStage: lifecycleStage as LifecycleStage,
    lastActivityAt,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
    rawData: getParams?.include_raw_data && typeof rawData === 'object' ? (rawData as Record<string, any>) : undefined,
  };
};

export const fromRemoteContactToModel = (
  connectionId: string,
  customerId: string,
  remoteContact: RemoteContact
): Prisma.CrmContactCreateInput => {
  return {
    id: uuidv5(remoteContact.id, connectionId),
    remoteId: remoteContact.id,
    customerId,
    connectionId,
    firstName: remoteContact.firstName,
    lastName: remoteContact.lastName,
    addresses: remoteContact.addresses,
    emailAddresses: remoteContact.emailAddresses,
    phoneNumbers: remoteContact.phoneNumbers,
    lifecycleStage: remoteContact.lifecycleStage,
    lastActivityAt: remoteContact.lastActivityAt?.toISOString(),
    remoteCreatedAt: remoteContact.createdAt?.toISOString(),
    remoteUpdatedAt: remoteContact.updatedAt?.toISOString(),
    remoteWasDeleted: remoteContact.isDeleted,
    lastModifiedAt: remoteContact.lastModifiedAt?.toISOString(),
    remoteAccountId: remoteContact.accountId,
    accountId: remoteContact.accountId ? uuidv5(remoteContact.accountId, connectionId) : null,
    remoteOwnerId: remoteContact.ownerId,
    ownerId: remoteContact.ownerId ? uuidv5(remoteContact.ownerId, connectionId) : null,
    rawData: remoteContact.rawData,
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
    addresses: remoteContact.addresses,
    email_addresses: remoteContact.emailAddresses,
    phone_numbers: remoteContact.phoneNumbers,
    lifecycle_stage: remoteContact.lifecycleStage,
    last_activity_at: remoteContact.lastActivityAt?.toISOString(),
    remote_created_at: remoteContact.createdAt?.toISOString(),
    remote_updated_at: remoteContact.updatedAt?.toISOString(),
    remote_was_deleted: remoteContact.isDeleted,
    last_modified_at: remoteContact.lastModifiedAt?.toISOString(),
    _remote_account_id: remoteContact.accountId,
    account_id: remoteContact.accountId ? uuidv5(remoteContact.accountId, connectionId) : null,
    _remote_owner_id: remoteContact.ownerId,
    owner_id: remoteContact.ownerId ? uuidv5(remoteContact.ownerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteContact.rawData,
  };
};
