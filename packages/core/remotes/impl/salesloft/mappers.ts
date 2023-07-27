import type { Contact, EmailAddress, PhoneNumber, Sequence, SequenceState, User } from '@supaglue/types/engagement';
import { camelcaseKeys } from '@supaglue/utils';

export const fromSalesloftPersonToContact = (record: Record<string, any>): Contact => {
  return {
    id: record.id.toString(),
    firstName: record.first_name ?? null,
    lastName: record.last_name ?? null,
    jobTitle: record.title ?? null,
    address: {
      street1: null,
      street2: null,
      city: record.city ?? null,
      state: record.state ?? null,
      country: record.country ?? null,
      postalCode: null,
    },
    emailAddresses: fromSalesloftPersonToEmailAddresses(record),
    phoneNumbers: fromSalesloftPersonToPhoneNumbers(record.phone_numbers ?? []),
    ownerId: record.owner?.id?.toString() ?? null,
    openCount: record.counts?.emails_viewed ?? 0,
    clickCount: record.counts?.emails_clicked ?? 0,
    bouncedCount: record.counts?.emails_bounced ?? 0,
    replyCount: record.counts?.emails_replied_to ?? 0,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    lastModifiedAt: new Date(record.updated_at),
    isDeleted: false,
    rawData: record,
  };
};

export const fromSalesloftPersonToEmailAddresses = (record: Record<string, any>): EmailAddress[] => {
  const out: EmailAddress[] = [];
  if (record.email_address) {
    out.push({
      emailAddress: record.email_address,
      emailAddressType: 'work',
    });
  }
  if (record.personal_email_address) {
    out.push({
      emailAddress: record.personal_email_address,
      emailAddressType: 'personal',
    });
  }
  if (record.secondary_email_address) {
    out.push({
      emailAddress: record.secondary_email_address,
      emailAddressType: null,
    });
  }
  return out;
};

export const fromSalesloftPersonToPhoneNumbers = (record: Record<string, any>): PhoneNumber[] => {
  const out: PhoneNumber[] = [];
  if (record.phone) {
    out.push({
      phoneNumber: record.phone,
      phoneNumberType: 'work',
    });
  }
  if (record.home_phone) {
    out.push({
      phoneNumber: record.home_phone,
      phoneNumberType: 'home',
    });
  }
  if (record.mobile_phone) {
    out.push({
      phoneNumber: record.mobile_phone,
      phoneNumberType: 'mobile',
    });
  }
  return out;
};

export const fromSalesloftUserToUser = (record: Record<string, any>): User => {
  return {
    id: record.id.toString(),
    firstName: record.first_name ?? null,
    lastName: record.last_name ?? null,
    email: record.email ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    lastModifiedAt: new Date(record.updated_at),
    isDeleted: false,
    rawData: record,
  };
};

export const fromSalesloftCadenceToSequence = (record: Record<string, any>, stepCount: number): Sequence => {
  return {
    id: record.id.toString(),
    name: record.name ?? null,
    isEnabled: !record.draft,
    numSteps: stepCount,
    metrics: camelcaseKeys(record.counts),
    tags: record.tags ?? [],
    ownerId: record.owner?.id?.toString() ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    lastModifiedAt: new Date(record.updated_at),
    isDeleted: !!record.archived_at,
    rawData: record,
  };
};

export const fromSalesloftCadenceMembershipToSequenceState = (record: Record<string, any>): SequenceState => {
  return {
    id: record.id.toString(),
    state: record.current_state ?? null,
    contactId: record.person?.id?.toString() ?? null,
    sequenceId: record.cadence?.id?.toString() ?? null,
    mailboxId: null,
    userId: record.user?.id?.toString() ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    lastModifiedAt: new Date(record.updated_at),
    isDeleted: false,
    rawData: record,
  };
};
