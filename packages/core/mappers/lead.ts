import { Address, EmailAddress, Lead, PhoneNumber } from '@supaglue/types';
import {
  fromAccountModel,
  fromContactModel,
  fromUserModel,
  toSnakecasedKeysAccount,
  toSnakecasedKeysContact,
  toSnakecasedKeysUser,
} from '.';
import { CrmLeadModelExpanded } from '../types';
import { toSnakecasedKeysAddress } from './address';
import { toSnakecasedKeysEmailAddress } from './email_address';
import { toSnakecasedKeysPhoneNumber } from './phone_number';

export const toSnakecasedKeysLead = (lead: Lead) => {
  return {
    owner_id: lead.ownerId,
    owner: lead.owner ? toSnakecasedKeysUser(lead.owner) : undefined,
    last_modified_at: lead.lastModifiedAt,
    remote_id: lead.remoteId,
    lead_source: lead.leadSource,
    title: lead.title,
    company: lead.company,
    first_name: lead.firstName,
    last_name: lead.lastName,
    addresses: lead.addresses.map(toSnakecasedKeysAddress),
    email_addresses: lead.emailAddresses.map(toSnakecasedKeysEmailAddress),
    phone_numbers: lead.phoneNumbers.map(toSnakecasedKeysPhoneNumber),
    converted_date: lead.convertedDate,
    remote_updated_at: lead.remoteUpdatedAt,
    remote_created_at: lead.remoteCreatedAt,
    remote_was_deleted: lead.remoteWasDeleted,
    converted_contact_id: lead.convertedContactId,
    converted_contact: lead.convertedContact ? toSnakecasedKeysContact(lead.convertedContact) : undefined,
    converted_account_id: lead.convertedAccountId,
    converted_account: lead.convertedAccount ? toSnakecasedKeysAccount(lead.convertedAccount) : undefined,
  };
};

export const fromLeadModel = (
  {
    remoteId,
    ownerId,
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
    remoteWasDeleted,
    lastModifiedAt,
  }: CrmLeadModelExpanded,
  expandedAssociations: string[] = []
): Lead => {
  const expandAccount = expandedAssociations.includes('converted_account');
  const expandContact = expandedAssociations.includes('converted_contact');
  const expandOwner = expandedAssociations.includes('owner');
  return {
    remoteId,
    ownerId,
    owner: expandOwner && owner ? fromUserModel(owner) : undefined,
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
    remoteCreatedAt,
    remoteUpdatedAt,
    remoteWasDeleted,
    lastModifiedAt,
  };
};
