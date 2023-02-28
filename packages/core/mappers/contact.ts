import { Address, Contact, CrmContactExpanded, EmailAddress, PhoneNumber } from '../types';
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
