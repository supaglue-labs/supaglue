import {
  Address,
  EmailAddress,
  PhoneNumber,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteUser,
} from '@supaglue/types/engagement';
import { OutreachRecord } from '.';

export const fromOutreachUserToRemoteUser = (record: OutreachRecord): RemoteUser => {
  const { id, attributes } = record;
  return {
    remoteId: id.toString(),
    firstName: (attributes.firstName as string) ?? null,
    lastName: (attributes.lastName as string) ?? null,
    email: (attributes.email as string) ?? null,
    remoteCreatedAt: new Date(attributes.createdAt as string),
    remoteUpdatedAt: new Date(attributes.updatedAt as string),
    remoteWasDeleted: false,
    remoteDeletedAt: null,
    detectedOrRemoteDeletedAt: null,
    rawData: record,
  };
};

export const fromOutreachProspectToRemoteContact = (record: OutreachRecord): RemoteContact => {
  const { id, attributes, relationships } = record;
  return {
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
    remoteOwnerId: relationships.owner.data.id ?? null,
    rawData: record,
  };
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

export const toOutreachProspectCreateParams = ({
  firstName,
  lastName,
  jobTitle,
  address,
  emailAddresses,
  phoneNumbers,
  customFields,
}: RemoteContactCreateParams): Record<string, any> => {
  return {
    data: {
      type: 'prospect',
      attributes: {
        firstName,
        lastName,
        jobTitle,
        ...toOutreachProspectAddressParams(address),
        ...toOutreachProspectEmailParams(emailAddresses),
        ...toOutreachProspectPhoneNumbers(phoneNumbers),
        ...customFields,
      },
      // TODO: Handle associations
    },
  };
};

const toOutreachProspectAddressParams = (address?: Address | null) => {
  if (address === undefined) {
    return {};
  }
  if (address === null) {
    return {
      addressStreet: null,
      addressStreet2: null,
      addressState: null,
      addressCity: null,
      addressZip: null,
      addressCountry: null,
    };
  }
  return {
    addressStreet: address.street1,
    addressStreet2: address.street2,
    addressState: address.state,
    addressCity: address.city,
    addressZip: address.postalCode,
    addressCountry: address.country,
  };
};

// TODO: Support email type + email object where the type is stored
const toOutreachProspectEmailParams = (emailAddresses?: EmailAddress[]) => {
  return {
    emails: emailAddresses?.map(({ emailAddress }) => emailAddress) ?? [],
  };
};

const toOutreachProspectPhoneNumbers = (phoneNumbers?: PhoneNumber[]) => {
  const homePhones: string[] = [];
  const workPhones: string[] = [];
  const otherPhones: string[] = [];
  const mobilePhones: string[] = [];
  phoneNumbers?.forEach(({ phoneNumber, phoneNumberType }) => {
    if (phoneNumber) {
      switch (phoneNumberType) {
        case 'home':
          homePhones.push(phoneNumber);
          break;
        case 'mobile':
          mobilePhones.push(phoneNumber);
          break;
        case 'other':
          otherPhones.push(phoneNumber);
          break;
        case 'work':
          workPhones.push(phoneNumber);
          break;
      }
    }
  });
  return {
    homePhones,
    workPhones,
    otherPhones,
    mobilePhones,
  };
};
