import { Account, Address, LifecycleStage, PhoneNumber } from '@supaglue/types';
import { CrmAccountModelExpanded } from '../types';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';
import { fromUserModel, toSnakecasedKeysUser } from './user';

export const toSnakecasedKeysAccount = (account: Account) => {
  return {
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
  };
};

export const fromAccountModel = (
  {
    remoteId,
    remoteWasDeleted,
    ownerId,
    owner,
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
  }: CrmAccountModelExpanded,
  expandedAssociations: string[] = []
): Account => {
  const expandOwner = expandedAssociations.includes('owner');
  return {
    remoteId,
    ownerId,
    owner: expandOwner && owner ? fromUserModel(owner) : undefined,
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
  };
};
