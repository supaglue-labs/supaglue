import {
  Address,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  EmailAddress,
  Mailbox,
  PhoneNumber,
  Sequence,
  SequenceState,
  SequenceStateCreateParams,
  User,
} from '@supaglue/types/engagement';
import { OutreachRecord } from '.';
import { removeUndefinedValues } from '../../../lib';

export const fromOutreachUserToUser = (record: OutreachRecord): User => {
  const { id, attributes } = record;
  return {
    id: id.toString(),
    firstName: (attributes.firstName as string) ?? null,
    lastName: (attributes.lastName as string) ?? null,
    email: (attributes.email as string) ?? null,
    createdAt: new Date(attributes.createdAt as string),
    updatedAt: new Date(attributes.updatedAt as string),
    isDeleted: false,
    lastModifiedAt: new Date(attributes.updatedAt as string),
    rawData: record,
  };
};

export const fromOutreachSequenceToSequence = (record: OutreachRecord): Sequence => {
  const { id, attributes, relationships } = record;
  return {
    id: id.toString(),
    name: (attributes.name as string) ?? null,
    isEnabled: attributes.enabled as boolean,
    numSteps: attributes.sequenceStepCount as number,
    tags: attributes.tags as string[],
    scheduleCount: (attributes.scheduleCount as number) ?? 0,
    openCount: (attributes.openCount as number) ?? 0,
    optOutCount: (attributes.optOutCount as number) ?? 0,
    clickCount: (attributes.clickCount as number) ?? 0,
    replyCount: (attributes.replyCount as number) ?? 0,
    createdAt: new Date(attributes.createdAt as string),
    updatedAt: new Date(attributes.updatedAt as string),
    isDeleted: false,
    lastModifiedAt: new Date(attributes.updatedAt as string),
    ownerId: relationships.owner?.data?.id?.toString() ?? null,
    rawData: record,
  };
};

export const fromOutreachMailboxToMailbox = (record: OutreachRecord): Mailbox => {
  const { id, attributes, relationships } = record;
  return {
    id: id.toString(),
    email: (attributes.email as string) ?? null,
    createdAt: new Date(attributes.createdAt as string),
    updatedAt: new Date(attributes.updatedAt as string),
    isDeleted: false,
    lastModifiedAt: new Date(attributes.updatedAt as string),
    userId: relationships.user?.data?.id?.toString() ?? null,
    rawData: record,
  };
};

export const fromOutreachSequenceStateToSequenceState = (record: OutreachRecord): SequenceState => {
  const { id, attributes, relationships } = record;
  return {
    id: id.toString(),
    state: attributes.state as string,
    sequenceId: relationships.sequence?.data?.id?.toString() ?? null,
    mailboxId: relationships.mailbox?.data?.id?.toString() ?? null,
    contactId: relationships.prospect?.data?.id?.toString() ?? null,
    createdAt: new Date(attributes.createdAt as string),
    updatedAt: new Date(attributes.updatedAt as string),
    isDeleted: false,
    lastModifiedAt: new Date(attributes.updatedAt as string),
    rawData: record,
  };
};

export const fromOutreachProspectToContact = (record: OutreachRecord): Contact => {
  const { id, attributes, relationships } = record;
  return {
    id: id.toString(),
    firstName: (attributes.firstName as string) ?? null,
    lastName: (attributes.lastName as string) ?? null,
    jobTitle: (attributes.title as string) ?? null,
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
    createdAt: new Date(attributes.createdAt as string),
    updatedAt: new Date(attributes.updatedAt as string),
    isDeleted: false,
    lastModifiedAt: new Date(attributes.updatedAt as string),
    ownerId: relationships.owner?.data?.id?.toString() ?? null,
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
  ownerId,
}: ContactCreateParams): Record<string, any> => {
  const attributes = {
    firstName,
    lastName,
    jobTitle,
    ...toOutreachProspectAddressParams(address),
    ...toOutreachProspectEmailParams(emailAddresses),
    ...toOutreachProspectPhoneNumbers(phoneNumbers),
    ...customFields,
  };
  removeUndefinedValues(attributes);
  if (ownerId === undefined) {
    return {
      data: {
        type: 'prospect',
        attributes,
      },
    };
  }
  return {
    data: {
      type: 'prospect',
      attributes,
      relationships: {
        owner:
          ownerId === null
            ? null
            : {
                data: {
                  type: 'user',
                  id: ownerId,
                },
              },
      },
    },
  };
};

export const toOutreachProspectUpdateParams = (params: ContactUpdateParams): Record<string, any> => {
  const updateParams = toOutreachProspectCreateParams(params);
  return {
    data: {
      ...updateParams.data,
      id: parseInt(params.id, 10),
    },
  };
};

export const toOutreachSequenceStateCreateParams = ({
  mailboxId,
  sequenceId,
  contactId,
}: SequenceStateCreateParams): Record<string, any> => {
  return {
    data: {
      type: 'sequenceState',
      relationships: {
        prospect: {
          data: {
            type: 'prospect',
            id: parseInt(contactId, 10),
          },
        },
        sequence: {
          data: {
            type: 'sequence',
            id: parseInt(sequenceId, 10),
          },
        },
        mailbox: {
          data: {
            type: 'mailbox',
            id: parseInt(mailboxId, 10),
          },
        },
      },
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
  if (!emailAddresses) {
    return;
  }
  return {
    emails: emailAddresses?.map(({ emailAddress }) => emailAddress) ?? [],
  };
};

const toOutreachProspectPhoneNumbers = (phoneNumbers?: PhoneNumber[]) => {
  if (!phoneNumbers) {
    return;
  }
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
