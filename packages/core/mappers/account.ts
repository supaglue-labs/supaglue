import type { CrmAccount } from '@supaglue/db';
import { Account, Address, PhoneNumber } from '../types';

export const fromAccountModel = ({
  id,
  remoteWasDeleted,
  owner,
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
    owner,
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
