import type { Contact, Mailbox, Sequence, SequenceState, User } from '@supaglue/types/engagement';

export const fromApolloContactToContact = (record: Record<string, any>): Contact => {
  return {
    id: record.id,
    firstName: record.first_name ?? null,
    lastName: record.last_name ?? null,
    jobTitle: record.title ?? null,
    address: {
      street1: record.street_address ?? null,
      street2: null,
      city: record.city ?? null,
      state: record.state ?? null,
      country: record.country ?? null,
      postalCode: record.postal_code ?? null,
    },
    emailAddresses: [
      {
        emailAddress: record.email ?? null,
        emailAddressType: null,
      },
    ],
    phoneNumbers: [
      {
        phoneNumber: record.sanitized_phone ?? null,
        phoneNumberType: null,
      },
    ],
    ownerId: record.owner_id ?? null,
    openCount: 0,
    clickCount: 0,
    bouncedCount: 0,
    replyCount: 0,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    lastModifiedAt: new Date(record.updated_at),
    isDeleted: false,
    rawData: record,
  };
};

export const fromApolloUserToUser = (record: Record<string, any>): User => {
  return {
    id: record.id,
    firstName: record.first_name ?? null,
    lastName: record.last_name ?? null,
    email: record.email ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: null, // Not supported in apollo
    lastModifiedAt: new Date(record.created_at),
    isDeleted: false,
    rawData: record,
  };
};

export const fromApolloSequenceToSequence = (record: Record<string, any>): Sequence => {
  return {
    id: record.id,
    name: record.name ?? null,
    isEnabled: record.active,
    numSteps: record.num_steps,
    tags: [],
    scheduleCount: record.unique_scheduled ?? 0,
    clickCount: record.unique_clicked ?? 0,
    openCount: record.unique_opened ?? 0,
    // Not supported by apollo
    optOutCount: 0,
    replyCount: record.unique_replied ?? 0,
    ownerId: record.owner_id ?? null,
    createdAt: new Date(record.created_at),
    // Not supported by apollo
    updatedAt: null,
    lastModifiedAt: new Date(record.created_at),
    isDeleted: record.archived ?? false,
    rawData: record,
  };
};

export const fromApolloEmailAccountsToMailbox = (record: Record<string, any>): Mailbox => {
  return {
    id: record.id,
    userId: record.user_id ?? null,
    email: record.email ?? null,
    createdAt: null,
    updatedAt: new Date(record.last_synced_at),
    lastModifiedAt: new Date(record.last_synced_at),
    isDeleted: false,
    rawData: record,
  };
};

export const fromApolloContactToSequenceStates = (record: Record<string, any>): SequenceState[] => {
  if (!record.contact_campaign_statuses?.length) {
    return [];
  }
  return record.contact_campaign_statuses.map((status: Record<string, any>) => ({
    id: status.id,
    sequenceId: status.emailer_campaign_id ?? null,
    contactId: record.contact_id ?? null,
    mailboxId: status.send_email_from_email_account_id ?? null,
    state: status.status ?? null,
    createdAt: new Date(status.added_at),
    updatedAt: null,
    lastModifiedAt: new Date(status.added_at),
    isDeleted: false,
    rawData: status,
  }));
};
