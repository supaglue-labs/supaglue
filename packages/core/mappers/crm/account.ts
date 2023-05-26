import type { CrmAccount, Prisma } from '@supaglue/db';
import type { GetInternalParams } from '@supaglue/types';
import type { Account, AccountV2, SnakecasedKeysCrmAccount, SnakecasedKeysCrmAccountV2 } from '@supaglue/types/crm';
import type { Address, LifecycleStage, PhoneNumber } from '@supaglue/types/crm/common';
import { v5 as uuidv5 } from 'uuid';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysCrmAccount = (account: Account): SnakecasedKeysCrmAccount => {
  return {
    id: account.id,
    owner_id: account.ownerId,
    last_modified_at: account.lastModifiedAt,
    remote_id: account.remoteId,
    name: account.name,
    description: account.description,
    industry: account.industry,
    website: account.website,
    number_of_employees: account.numberOfEmployees,
    addresses: account.addresses.map(toSnakecasedKeysAddress),
    phone_numbers: account.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    last_activity_at: account.lastActivityAt,
    lifecycle_stage: account.lifecycleStage,
    remote_created_at: account.remoteCreatedAt,
    remote_updated_at: account.remoteUpdatedAt,
    remote_was_deleted: account.remoteWasDeleted,
    raw_data: account.rawData,
  };
};

export const toSnakecasedKeysCrmAccountV2 = (account: AccountV2): SnakecasedKeysCrmAccountV2 => {
  return {
    owner_id: account.ownerId,
    last_modified_at: account.lastModifiedAt,
    id: account.id,
    name: account.name,
    description: account.description,
    industry: account.industry,
    website: account.website,
    number_of_employees: account.numberOfEmployees,
    addresses: account.addresses.map(toSnakecasedKeysAddress),
    phone_numbers: account.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    last_activity_at: account.lastActivityAt,
    lifecycle_stage: account.lifecycleStage,
    created_at: account.createdAt,
    updated_at: account.updatedAt,
    is_deleted: account.isDeleted,
    raw_data: account.rawData,
  };
};

export const fromAccountModel = (
  {
    id,
    remoteId,
    remoteWasDeleted,
    ownerId,
    name,
    description,
    industry,
    website,
    numberOfEmployees,
    addresses,
    phoneNumbers,
    lifecycleStage,
    lastActivityAt,
    remoteCreatedAt,
    remoteUpdatedAt,
    lastModifiedAt,
    rawData,
  }: CrmAccount,
  getParams?: GetInternalParams
): Account => {
  return {
    id,
    remoteId,
    ownerId,
    name,
    description,
    industry,
    website,
    numberOfEmployees,
    addresses: addresses as Address[],
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

export const fromRemoteAccountToModel = (
  connectionId: string,
  customerId: string,
  remoteAccount: AccountV2
): Prisma.CrmAccountCreateInput => {
  return {
    id: uuidv5(remoteAccount.id, connectionId),
    name: remoteAccount.name,
    description: remoteAccount.description,
    industry: remoteAccount.industry,
    website: remoteAccount.website,
    numberOfEmployees: remoteAccount.numberOfEmployees,
    addresses: remoteAccount.addresses,
    phoneNumbers: remoteAccount.phoneNumbers,
    lastActivityAt: remoteAccount.lastActivityAt?.toISOString(),
    lifecycleStage: remoteAccount.lifecycleStage,
    remoteId: remoteAccount.id,
    remoteCreatedAt: remoteAccount.createdAt?.toISOString(),
    remoteUpdatedAt: remoteAccount.updatedAt?.toISOString(),
    remoteWasDeleted: remoteAccount.isDeleted,
    lastModifiedAt: remoteAccount.lastModifiedAt?.toISOString(),
    customerId,
    connectionId,
    remoteOwnerId: remoteAccount.ownerId,
    ownerId: remoteAccount.ownerId ? uuidv5(remoteAccount.ownerId, connectionId) : null,
    rawData: remoteAccount.rawData,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteAccountToDbAccountParams = (
  connectionId: string,
  customerId: string,
  remoteAccount: AccountV2
) => {
  return {
    id: uuidv5(remoteAccount.id, connectionId),
    name: remoteAccount.name,
    description: remoteAccount.description,
    industry: remoteAccount.industry,
    website: remoteAccount.website,
    number_of_employees: remoteAccount.numberOfEmployees,
    addresses: remoteAccount.addresses,
    phone_numbers: remoteAccount.phoneNumbers,
    last_activity_at: remoteAccount.lastActivityAt?.toISOString(),
    lifecycle_stage: remoteAccount.lifecycleStage,
    remote_id: remoteAccount.id,
    remote_created_at: remoteAccount.createdAt?.toISOString(),
    remote_updated_at: remoteAccount.updatedAt?.toISOString(),
    remote_was_deleted: remoteAccount.isDeleted,
    last_modified_at: remoteAccount.lastModifiedAt?.toISOString(),
    customer_id: customerId,
    connection_id: connectionId,
    _remote_owner_id: remoteAccount.ownerId,
    owner_id: remoteAccount.ownerId ? uuidv5(remoteAccount.ownerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteAccount.rawData,
  };
};
