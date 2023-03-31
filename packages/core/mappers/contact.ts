import { Address, Contact, EmailAddress, LifecycleStage, PhoneNumber, RemoteContact } from '@supaglue/types';
import { v4 as uuidv4 } from 'uuid';
import { CrmContactExpanded } from '../types';
import { fromAccountModel } from './account';
import { fromUserModel } from './user';

export const fromContactModel = (
  {
    id,
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
  }: CrmContactExpanded,
  expandedAssociations: string[] = []
): Contact => {
  const expandAccount = expandedAssociations.includes('account');
  const expandOwner = expandedAssociations.includes('owner');
  return {
    id,
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

// TODO: Use prisma generator to generate return type
export const fromRemoteContactToDbContactParams = (
  connectionId: string,
  customerId: string,
  remoteContact: RemoteContact
) => {
  const lastModifiedAt =
    remoteContact.remoteUpdatedAt || remoteContact.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(
            remoteContact.remoteUpdatedAt?.getTime() || 0,
            remoteContact.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
      : undefined;

  return {
    id: uuidv4(),
    connection_id: connectionId,
    customer_id: customerId,
    remote_id: remoteContact.remoteId,
    first_name: remoteContact.firstName,
    last_name: remoteContact.lastName,
    addresses: remoteContact.addresses,
    email_addresses: remoteContact.emailAddresses,
    phone_numbers: remoteContact.phoneNumbers,
    lifecycle_stage: remoteContact.lifecycleStage,
    last_activity_at: remoteContact.lastActivityAt?.toISOString(),
    remote_created_at: remoteContact.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteContact.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteContact.remoteWasDeleted,
    remote_deleted_at: remoteContact.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteContact.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    _remote_account_id: remoteContact.remoteAccountId,
    _remote_owner_id: remoteContact.remoteOwnerId,
    updated_at: new Date().toISOString(),
  };
};
