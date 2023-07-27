import type {
  Address,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  Mailbox,
  PhoneNumber,
  PhoneNumberType,
  Sequence,
  SequenceState,
  SequenceStateCreateParams,
  User,
} from '@supaglue/types/engagement';

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
    phoneNumbers: fromApolloPhonesToPhoneNumbers(record.phone_numbers ?? []),
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

const fromApolloPhonesToPhoneNumbers = (phoneNumbers: Record<string, any>[]): PhoneNumber[] => {
  return phoneNumbers.map((phone) => ({
    phoneNumber: phone.sanitized_number,
    phoneNumberType: fromApolloPhoneTypeToPhoneType(phone.type),
  }));
};

const fromApolloPhoneTypeToPhoneType = (phoneType: string | undefined): PhoneNumberType | null => {
  switch (phoneType) {
    case 'home':
      return 'home';
    case 'mobile':
      return 'mobile';
    case 'work':
    case 'work_hq':
      return 'work';
    case 'other':
      return 'other';
    default:
      return null;
  }
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
    metrics: {
      uniqueScheduled: record.unique_scheduled ?? 0,
      uniqueDelivered: record.unique_delivered ?? 0,
      uniqueBounced: record.unique_bounced ?? 0,
      uniqueClicked: record.unique_clicked ?? 0,
      uniqueOpened: record.unique_opened ?? 0,
      uniqueReplied: record.unique_replied ?? 0,
      uniqueDemoed: record.unique_demoed ?? 0,
      bounceRate: record.bounce_rate ?? 0.0,
      openRate: record.open_rate ?? 0.0,
      clickRate: record.click_rate ?? 0.0,
      replyRate: record.reply_rate ?? 0.0,
      spamBlockedRate: record.spam_blocked_rate ?? 0.0,
      demoRate: record.demo_rate ?? 0.0,
    },
    ownerId: record.user_id ?? null,
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
    contactId: record.id ?? null,
    mailboxId: status.send_email_from_email_account_id ?? null,
    userId: status.added_by_user_id ?? null,
    state: status.status ?? null,
    createdAt: new Date(status.added_at),
    updatedAt: null,
    lastModifiedAt: new Date(status.added_at),
    isDeleted: false,
    rawData: status,
  }));
};

export const toApolloContactCreateParams = (params: ContactCreateParams): Record<string, any> => {
  return {
    first_name: params.firstName,
    last_name: params.lastName,
    title: params.jobTitle,
    email: params.emailAddresses?.[0]?.emailAddress,
    present_raw_address: params.address ? getRawAddressString(params.address) : undefined,
    ...params.customFields,
  };
};
export const toApolloContactUpdateParams = (params: ContactUpdateParams): Record<string, any> => {
  return {
    first_name: params.firstName,
    last_name: params.lastName,
    title: params.jobTitle,
    email: params.emailAddresses?.[0]?.emailAddress,
    present_raw_address: params.address ? getRawAddressString(params.address) : undefined,
    corporate_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'work')?.phoneNumber,
    home_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'home')?.phoneNumber,
    mobile_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'mobile')?.phoneNumber,
    other_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'other')?.phoneNumber,
    ...params.customFields,
  };
};

const getRawAddressString = (params: Address): string => {
  return [params.street1, params.city, params.state, params.postalCode, params.country].filter((v) => !!v).join(', ');
};

export const toApolloSequenceStateCreateParams = (params: SequenceStateCreateParams): Record<string, any> => {
  return {
    contact_ids: [params.contactId],
    emailer_campaign_id: params.sequenceId,
    send_email_from_email_account_id: params.mailboxId,
    userId: params.userId,
  };
};
