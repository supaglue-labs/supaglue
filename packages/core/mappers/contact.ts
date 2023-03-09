import { v4 as uuidv4 } from 'uuid';
import { Address, Contact, CrmContactExpanded, EmailAddress, PhoneNumber, RemoteContact } from '../types';
import { fromAccountModel } from './account';

export const fromContactModel = (
  {
    id,
    accountId,
    account,
    firstName,
    lastName,
    addresses,
    emailAddresses,
    phoneNumbers,
    lastActivityAt,
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
  }: CrmContactExpanded,
  expandedAssociations: string[] = []
): Contact => {
  const expandAccount = expandedAssociations.includes('account');
  return {
    id,
    accountId,
    account: expandAccount && account ? fromAccountModel(account) : undefined,
    firstName,
    lastName,
    addresses: addresses as Address[],
    emailAddresses: emailAddresses as EmailAddress[],
    phoneNumbers: phoneNumbers as PhoneNumber[],
    lastActivityAt,
    createdAt: remoteCreatedAt,
    updatedAt: remoteUpdatedAt,
    wasDeleted: remoteWasDeleted,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteContactToDbContactParams = (
  connectionId: string,
  customerId: string,
  remoteContact: RemoteContact
) => {
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
    last_activity_at: remoteContact.lastActivityAt?.toISOString(),
    remote_created_at: remoteContact.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteContact.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteContact.remoteWasDeleted,
    _remote_account_id: remoteContact.remoteAccountId,
    updated_at: new Date().toISOString(),
  };
};
