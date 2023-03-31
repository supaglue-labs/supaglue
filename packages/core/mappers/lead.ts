import { Address, EmailAddress, Lead, PhoneNumber, RemoteLead } from '@supaglue/types';
import { v4 as uuidv4 } from 'uuid';
import { fromAccountModel, fromContactModel, fromUserModel } from '.';
import { CrmLeadExpanded } from '../types';

export const fromLeadModel = (
  {
    id,
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
  }: CrmLeadExpanded,
  expandedAssociations: string[] = []
): Lead => {
  const expandAccount = expandedAssociations.includes('converted_account');
  const expandContact = expandedAssociations.includes('converted_contact');
  const expandOwner = expandedAssociations.includes('owner');
  return {
    id,
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

// TODO: Use prisma generator to generate return type
export const fromRemoteLeadToDbLeadParams = (connectionId: string, customerId: string, remoteLead: RemoteLead) => {
  const lastModifiedAt =
    remoteLead.remoteUpdatedAt || remoteLead.detectedOrRemoteDeletedAt
      ? new Date(
          Math.max(remoteLead.remoteUpdatedAt?.getTime() || 0, remoteLead.detectedOrRemoteDeletedAt?.getTime() || 0)
        )
      : undefined;

  return {
    id: uuidv4(),
    remote_id: remoteLead.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    lead_source: remoteLead.leadSource,
    title: remoteLead.title,
    company: remoteLead.company,
    first_name: remoteLead.firstName,
    last_name: remoteLead.lastName,
    addresses: remoteLead.addresses,
    phone_numbers: remoteLead.phoneNumbers,
    email_addresses: remoteLead.emailAddresses,
    remote_created_at: remoteLead.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteLead.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteLead.remoteWasDeleted,
    remote_deleted_at: remoteLead.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteLead.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    converted_date: remoteLead.convertedDate?.toISOString(),
    _converted_remote_account_id: remoteLead.convertedRemoteAccountId,
    _converted_remote_contact_id: remoteLead.convertedRemoteContactId,
    _remote_owner_id: remoteLead.remoteOwnerId,
    updated_at: new Date().toISOString(),
  };
};
