import { PhoneNumber, RemoteContact } from '@supaglue/types/engagement';
import { OutreachRecord } from '.';

export const fromOutreachProspectToRemoteContact = (record: OutreachRecord): RemoteContact => {
  const { id, attributes } = record;
  const out = {
    remoteId: id.toString(),
    firstName: (attributes.firstName as string) ?? null,
    lastName: (attributes.lastName as string) ?? null,
    jobTitle: (attributes.jobTitle as string) ?? null,
    address: {
      street1: (attributes.addressStreet as string) ?? null,
      street2: (attributes.addressStreet2 as string) ?? null,
      state: (attributes.addressState as string) ?? null,
      postalCode: (attributes.addressZip as string) ?? null,
      city: (attributes.addressCity as string) ?? null,
      country: (attributes.addressCountry as string) ?? null,
    },
    emailAddresses: attributes.emailContacts.map(
      (record: { email: string; email_type: 'work' | 'personal' | null }) => ({
        emailAddress: record.email,
        emailAddressType: record.email_type,
      })
    ),
    phoneNumbers: fromOutreachPhonesToContactPhone(record),
    openCount: (attributes.openCount as number) ?? 0,
    clickCount: (attributes.clickCount as number) ?? 0,
    replyCount: (attributes.replyCount as number) ?? 0,
    bouncedCount: (attributes.bouncedCount as number) ?? 0,
    remoteCreatedAt: new Date(attributes.createdAt as string),
    remoteUpdatedAt: new Date(attributes.updatedAt as string),
    remoteWasDeleted: false,
    remoteDeletedAt: null,
    detectedOrRemoteDeletedAt: null,
    rawData: record,
  };
  return out;
};

export const fromOutreachPhonesToContactPhone = ({ attributes }: OutreachRecord): PhoneNumber[] => {
  const mobile = attributes.mobilePhones.map((phone: string) => ({
    phoneNumber: phone,
    phoneNumberType: 'mobile',
  }));
  const home = attributes.homePhones.map((phone: string) => ({
    phoneNumber: phone,
    phoneNumberType: 'home',
  }));
  const work = attributes.workPhones.map((phone: string) => ({
    phoneNumber: phone,
    phoneNumberType: 'work',
  }));
  const other = attributes.otherPhones.map((phone: string) => ({
    phoneNumber: phone,
    phoneNumberType: 'other',
  }));
  const voip = attributes.voipPhones.map((phone: string) => ({
    phoneNumber: phone,
    phoneNumberType: 'other',
  }));
  return [...mobile, ...home, ...work, ...other, ...voip];
};
