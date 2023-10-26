import type {
  Account,
  AccountCreateParams,
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
import { camelcaseKeys } from '@supaglue/utils';
import { pick, removeValues } from '../../../lib/util';
import type { ApolloEmailerCampaign } from './client';

export const fromApolloAccountToAccount = (record: Record<string, any>): Account => {
  return {
    id: record.id,
    name: record.name ?? null,
    domain: record.domain ?? null,
    ownerId: record.owner_id ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: null, // Not supported in apollo
    lastModifiedAt: new Date(record.created_at),
    isDeleted: false,
    rawData: record,
  };
};

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
        emailAddressType: 'primary',
      },
    ],
    phoneNumbers: fromApolloPhonesToPhoneNumbers(record.phone_numbers ?? []),
    ownerId: record.owner_id ?? null,
    accountId: record.account_id ?? null,
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
    isLocked: null, // apollo has no concept of this
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
    isDisabled: !record.active,
  };
};

export const fromApolloContactToSequenceStates = (record: Record<string, any>): SequenceState[] => {
  if (!record.contact_campaign_statuses?.length) {
    return [];
  }
  return record.contact_campaign_statuses.map((status: Record<string, any>) =>
    fromApolloContactCampaignStatusToSequenceState(record.id, status)
  );
};

export const fromApolloContactCampaignStatusToSequenceState = (
  contactId: string,
  status: Record<string, any>
): SequenceState => {
  return {
    id: status.id,
    sequenceId: status.emailer_campaign_id ?? null,
    contactId: contactId ?? null,
    mailboxId: status.send_email_from_email_account_id ?? null,
    userId: status.added_by_user_id ?? null,
    state: status.status ?? null,
    createdAt: new Date(status.added_at),
    updatedAt: null,
    lastModifiedAt: new Date(status.added_at),
    isDeleted: false,
    rawData: status,
  };
};

export const toApolloAccountCreateParams = (params: AccountCreateParams): Record<string, any> => {
  return {
    name: params.name,
    domain: params.domain,
  };
};

export const toApolloAccountUpdateParams = toApolloAccountCreateParams;

/**
 * @see https://apolloio.github.io/apollo-api-docs/?shell#create-a-contact
 */
export const toApolloContactCreateParams = (params: ContactCreateParams): Record<string, any> => {
  return {
    first_name: params.firstName,
    last_name: params.lastName,
    title: params.jobTitle,
    email: params.emailAddresses?.[0]?.emailAddress,
    present_raw_address: params.address ? getRawAddressString(params.address) : undefined,
    account_id: params.accountId,
    // Apollo docs appears to not support phone during creation
    // However empirically it actually works, so we keep the phone mapping logic here.
    mobile_phone:
      params.phoneNumbers?.find((p) => p.phoneNumberType === 'mobile')?.phoneNumber ??
      params.phoneNumbers?.find((p) => p.phoneNumberType === 'primary')?.phoneNumber,
    corporate_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'work')?.phoneNumber,
    home_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'home')?.phoneNumber,
    other_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'other')?.phoneNumber,
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
    mobile_phone:
      params.phoneNumbers?.find((p) => p.phoneNumberType === 'mobile')?.phoneNumber ??
      params.phoneNumbers?.find((p) => p.phoneNumberType === 'primary')?.phoneNumber,
    corporate_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'work')?.phoneNumber,
    home_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'home')?.phoneNumber,
    other_phone: params.phoneNumbers?.find((p) => p.phoneNumberType === 'other')?.phoneNumber,
    account_id: params.accountId,
    ...params.customFields,
  };
};

export const getRawAddressString = (params: Address): string => {
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

export const fromApolloEmailerCampaignToSequence = (c: ApolloEmailerCampaign): Sequence => ({
  name: c.name ?? '',
  createdAt: c.created_at ? new Date(c.created_at) : null,
  updatedAt: null,
  id: c.id,
  ownerId: c.user_id ?? null,
  numSteps: c.num_steps ?? 0,
  isEnabled: c.active ?? false,
  isDeleted: c.archived,
  isArchived: c.archived,
  shareType: c.permissions === 'private' ? 'private' : 'team',
  lastModifiedAt: new Date(), // Apollo does not return this so we have no way of knowning
  tags: c.label_ids, // Apollo labels require explicit ids, but we don't have mapping for them
  metrics: camelcaseKeys(
    removeValues(
      pick(c, [
        'unique_scheduled',
        'unique_delivered',
        'unique_bounced',
        'unique_opened',
        'unique_replied',
        'unique_demoed',
        'unique_clicked',
        'unique_unsubscribed',
        'bounce_rate',
        'open_rate',
        'click_rate',
        'reply_rate',
        'spam_blocked_rate',
        'opt_out_rate',
        'demo_rate',
      ]),
      (_, v) => typeof v !== 'number'
    )
  ),
  rawData: c,
});
