import type { CrmAccount } from '@supaglue/db';
import { v4 as uuidv4 } from 'uuid';
import { Account, Address, PhoneNumber, RemoteAccount } from '../types';

export const fromAccountModel = ({
  id,
  remoteWasDeleted,
  ownerId,
  name,
  description,
  industry,
  website,
  numberOfEmployees,
  addresses,
  phoneNumbers,
  lastActivityAt,
  remoteCreatedAt,
  remoteUpdatedAt,
}: CrmAccount): Account => {
  return {
    id,
    ownerId,
    name,
    description,
    industry,
    website,
    numberOfEmployees,
    addresses: addresses as Address[],
    phoneNumbers: phoneNumbers as PhoneNumber[],
    lastActivityAt,
    createdAt: remoteCreatedAt,
    updatedAt: remoteUpdatedAt,
    wasDeleted: remoteWasDeleted,
  };
};

// TODO: Use prisma generator to generate return type
export const fromRemoteAccountToDbAccountParams = (
  connectionId: string,
  customerId: string,
  remoteAccount: RemoteAccount
) => {
  return {
    id: uuidv4(),
    name: remoteAccount.name,
    description: remoteAccount.description,
    industry: remoteAccount.industry,
    website: remoteAccount.website,
    number_of_employees: remoteAccount.numberOfEmployees,
    addresses: remoteAccount.addresses,
    phone_numbers: remoteAccount.phoneNumbers,
    last_activity_at: remoteAccount.lastActivityAt?.toISOString(),
    remote_id: remoteAccount.remoteId,
    remote_created_at: remoteAccount.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteAccount.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteAccount.remoteWasDeleted,
    _remote_owner_id: remoteAccount.remoteOwnerId,
    customer_id: customerId,
    connection_id: connectionId,
    updated_at: new Date().toISOString(),
  };
};
