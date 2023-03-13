import { v4 as uuidv4 } from 'uuid';
import { fromAccountModel, fromContactModel } from '.';
import { Address, CrmLeadExpanded, EmailAddress, Lead, PhoneNumber, RemoteLead } from '../types';

export const fromLeadModel = (
  {
    id,
    remoteWasDeleted,
    ownerId,
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
    ownerId,
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

// TODO: Use prisma generator to generate return type
export const fromRemoteLeadToDbLeadParams = (connectionId: string, customerId: string, remoteLead: RemoteLead) => {
  return {
    id: uuidv4(),
    remote_id: remoteLead.remoteId,
    connection_id: connectionId,
    customer_id: customerId,
    remote_was_deleted: remoteLead.remoteWasDeleted,
    lead_source: remoteLead.leadSource,
    title: remoteLead.title,
    company: remoteLead.company,
    first_name: remoteLead.firstName,
    last_name: remoteLead.lastName,
    addresses: remoteLead.addresses,
    email_addresses: remoteLead.emailAddresses,
    remote_created_at: remoteLead.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteLead.remoteUpdatedAt?.toISOString(),
    converted_date: remoteLead.convertedDate?.toISOString(),
    _converted_remote_account_id: remoteLead.convertedRemoteAccountId,
    _converted_remote_contact_id: remoteLead.convertedRemoteContactId,
    _remote_owner_id: remoteLead.remoteOwnerId,
    updated_at: new Date().toISOString(),
  };
};
