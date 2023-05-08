import { RemoteContact } from '@supaglue/types/engagement';
import { v5 as uuidv5 } from 'uuid';

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
    id: uuidv5(remoteContact.remoteId, connectionId),
    remote_id: remoteContact.remoteId,
    customer_id: customerId,
    connection_id: connectionId,
    first_name: remoteContact.firstName,
    last_name: remoteContact.lastName,
    job_title: remoteContact.jobTitle,
    address: remoteContact.address,
    email_addresses: remoteContact.emailAddresses,
    phone_numbers: remoteContact.phoneNumbers,
    open_count: remoteContact.openCount,
    click_count: remoteContact.clickCount,
    reply_count: remoteContact.replyCount,
    bounced_count: remoteContact.bouncedCount,
    remote_created_at: remoteContact.remoteCreatedAt?.toISOString(),
    remote_updated_at: remoteContact.remoteUpdatedAt?.toISOString(),
    remote_was_deleted: remoteContact.remoteWasDeleted,
    remote_deleted_at: remoteContact.remoteDeletedAt?.toISOString(),
    detected_or_remote_deleted_at: remoteContact.detectedOrRemoteDeletedAt?.toISOString(),
    last_modified_at: lastModifiedAt?.toISOString(),
    updated_at: new Date().toISOString(),
    raw_data: remoteContact.rawData,
  };
};
