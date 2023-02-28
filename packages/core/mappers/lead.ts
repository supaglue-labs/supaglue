import { fromAccountModel, fromContactModel } from '.';
import { Address, CrmLeadExpanded, EmailAddress, Lead, PhoneNumber } from '../types';

export const fromLeadModel = (
  {
    id,
    remoteWasDeleted,
    owner,
    leadSource,
    title,
    company,
    firstName,
    lastName,
    addresses,
    phoneNumbers,
    emailAddresses,
    convertedDate,
    convertedAccountId,
    convertedContactId,
    convertedAccount,
    convertedContact,
    remoteCreatedAt,
    remoteUpdatedAt,
  }: CrmLeadExpanded,
  expandedAssociations: string[] = []
): Lead => {
  const expandAccount = expandedAssociations.includes('converted_account');
  const expandContact = expandedAssociations.includes('converted_contact');
  return {
    id,
    owner,
    leadSource,
    title,
    company,
    firstName,
    lastName,
    addresses: addresses as Address[],
    phoneNumbers: phoneNumbers as PhoneNumber[],
    emailAddresses: emailAddresses as EmailAddress[],
    convertedDate,
    convertedAccountId,
    convertedContactId,
    convertedAccount: expandAccount && convertedAccount ? fromAccountModel(convertedAccount) : undefined,
    convertedContact: expandContact && convertedContact ? fromContactModel(convertedContact) : undefined,
    createdAt: remoteCreatedAt,
    updatedAt: remoteUpdatedAt,
    wasDeleted: remoteWasDeleted,
  };
};
