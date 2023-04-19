import { Address, Contact, EmailAddress, LifecycleStage, PhoneNumber } from '@supaglue/types';
import { CrmContactModelExpanded } from '../types';
import { fromAccountModel, toSnakecasedKeysAccount } from './account';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';
import { fromUserModel, toSnakecasedKeysUser } from './user';

export const toSnakecasedKeysContact = (contact: Contact) => {
  return {
    owner_id: contact.ownerId,
    owner: contact.owner ? toSnakecasedKeysUser(contact.owner) : undefined,
    account_id: contact.accountId,
    account: contact.account ? toSnakecasedKeysAccount(contact.account) : undefined,
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
  };
};

export const fromContactModel = (
  {
    remoteId,
    ownerId,
    owner,
    accountId,
    account,
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
  }: CrmContactModelExpanded,
  expandedAssociations: string[] = []
): Contact => {
  const expandAccount = expandedAssociations.includes('account');
  const expandOwner = expandedAssociations.includes('owner');
  return {
    remoteId,
    ownerId,
    owner: expandOwner && owner ? fromUserModel(owner) : undefined,
    accountId,
    account: expandAccount && account ? fromAccountModel(account) : undefined,
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
  };
};
