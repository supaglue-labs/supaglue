import { CrmAccount } from '@supaglue/db';
import { GetInternalParams } from '@supaglue/types';
import { Address, LifecycleStage, PhoneNumber } from '@supaglue/types/base';
import { Account, RemoteAccount, SnakecasedKeysAccount } from '@supaglue/types/crm';
import { v5 as uuidv5 } from 'uuid';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';
import { toSnakecasedKeysUser } from './user';

export const toSnakecasedKeysAccount = (account: Account): SnakecasedKeysAccount => {
  return {
    id: account.id,
    owner_id: account.ownerId,
    owner: account.owner ? toSnakecasedKeysUser(account.owner) : undefined,
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

// TODO: Use prisma generator to generate return type
export const fromRemoteAccountToDbAccountParams = (
  connectionId: string,
  customerId: string,
  remoteAccount: RemoteAccount
) => {
  const lastModifiedAt =
    remoteAccount.remoteUpdatedAt || remoteAccount.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(
            remoteAccount.remoteUpdatedAt?.getTime() || 0,
            remoteAccount.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
      : undefined;

  return {
    id: uuidv5(remoteAccount.remoteId, connectionId),
    name: remoteAccount.name,
    description: remoteAccount.description,
    industry: remoteAccount.industry,
    website: remoteAccount.website,
    number_of_employees: remoteAccount.numberOfEmployees,
    addresses: remoteAccount.addresses,
    phone_numbers: remoteAccount.phoneNumbers,
    last_activity_at: remoteAccount.lastActivityAt?.toISOString(),
    lifecycle_stage: remoteAccount.lifecycleStage,
    remote_id: remoteAccount.remoteId,
    remote_created_at: remoteAccount.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteAccount.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteAccount.remoteWasDeleted,
    remote_deleted_at: remoteAccount.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteAccount.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    customer_id: customerId,
    connection_id: connectionId,
    _remote_owner_id: remoteAccount.remoteOwnerId,
    owner_id: remoteAccount.remoteOwnerId ? uuidv5(remoteAccount.remoteOwnerId, connectionId) : null,
    updated_at: new Date().toISOString(),
    raw_data: remoteAccount.rawData,
  };
};
