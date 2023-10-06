import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  Address,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  EmailAddress,
  Mailbox,
  PhoneNumber,
  Sequence,
  SequenceCreateParams,
  SequenceState,
  SequenceStateCreateParams,
  SequenceStepCreateParams,
  SequenceTemplateCreateParams,
  User,
} from '@supaglue/types/engagement';
import type { OutreachRecord } from '.';
import { BadRequestError } from '../../../errors';
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
    metrics: {
      scheduleCount: (attributes.scheduleCount as number) ?? 0,
      openCount: (attributes.openCount as number) ?? 0,
      optOutCount: (attributes.optOutCount as number) ?? 0,
      clickCount: (attributes.clickCount as number) ?? 0,
      replyCount: (attributes.replyCount as number) ?? 0,
      deliverCount: (attributes.deliverCount as number) ?? 0,
      failureCount: (attributes.failureCount as number) ?? 0,
      neutralReplyCount: (attributes.neutralReplyCount as number) ?? 0,
      negativeReplyCount: (attributes.negativeReplyCount as number) ?? 0,
      positiveReplyCount: (attributes.positiveReplyCount as number) ?? 0,
      numRepliedProspects: (attributes.numRepliedProspects as number) ?? 0,
      numContactedProspects: (attributes.numContactedProspects as number) ?? 0,
    },
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

export const fromOutreachAccountToAccount = (record: OutreachRecord): Account => {
  const { attributes, relationships } = record;
  return {
    id: record.id.toString(),
    name: record.attributes.name as string,
    domain: record.attributes.domain as string,
    ownerId: relationships.owner?.data?.id?.toString() ?? null,
    createdAt: new Date(attributes.createdAt as string),
    updatedAt: new Date(attributes.updatedAt as string),
    isDeleted: false,
    lastModifiedAt: new Date(attributes.updatedAt as string),
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
    userId: relationships.creator?.data?.id?.toString() ?? null,
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
    accountId: relationships.account?.data?.id?.toString() ?? null,
    rawData: record,
  };
};

export const fromOutreachPhonesToContactPhone = ({ attributes }: OutreachRecord): PhoneNumber[] => {
  const mobile =
    attributes.mobilePhones?.map((phone: string) => ({
      phoneNumber: phone,
      phoneNumberType: 'mobile',
    })) ?? [];
  const home =
    attributes.homePhones?.map((phone: string) => ({
      phoneNumber: phone,
      phoneNumberType: 'home',
    })) ?? [];
  const work =
    attributes.workPhones?.map((phone: string) => ({
      phoneNumber: phone,
      phoneNumberType: 'work',
    })) ?? [];
  const other =
    attributes.otherPhones?.map((phone: string) => ({
      phoneNumber: phone,
      phoneNumberType: 'other',
    })) ?? [];
  const voip =
    attributes.voipPhones?.map((phone: string) => ({
      phoneNumber: phone,
      phoneNumberType: 'other',
    })) ?? [];
  return [...mobile, ...home, ...work, ...other, ...voip];
};

export const toOutreachAccountCreateParams = ({ name, domain, ownerId, customFields }: AccountCreateParams) => {
  const attributes = {
    domain,
    name,
    ...customFields,
  };
  removeUndefinedValues(attributes);
  if (ownerId === undefined) {
    return {
      data: {
        type: 'account',
        attributes,
      },
    };
  }
  return {
    data: {
      type: 'account',
      attributes,
      relationships: {
        owner:
          ownerId === null
            ? null
            : {
                data: {
                  type: 'user',
                  id: parseInt(ownerId, 10),
                },
              },
      },
    },
  };
};

export const toOutreachAccountUpdateParams = (params: AccountUpdateParams): Record<string, any> => {
  const updateParams = toOutreachAccountCreateParams(params);
  return {
    data: {
      ...updateParams.data,
      id: parseInt(params.id, 10),
    },
  };
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
  accountId,
}: ContactCreateParams): Record<string, any> => {
  const attributes = {
    firstName,
    lastName,
    title: jobTitle,
    ...toOutreachProspectAddressParams(address),
    ...toOutreachProspectEmailParams(emailAddresses),
    ...toOutreachProspectPhoneNumbers(phoneNumbers),
    ...customFields,
  };
  removeUndefinedValues(attributes);
  if (ownerId === undefined && accountId === undefined) {
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
        owner: !ownerId
          ? ownerId
          : {
              data: {
                type: 'user',
                id: ownerId,
              },
            },
        account: !accountId
          ? accountId
          : {
              data: {
                type: 'account',
                id: accountId,
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
  if (!mailboxId) {
    throw new BadRequestError('Mailbox ID is required for Outreach');
  }
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

export const toOutreachSequenceCreateParams = ({
  name,
  tags,
  ownerId,
  customFields,
}: SequenceCreateParams): Record<string, any> => {
  if (ownerId === undefined) {
    return {
      data: {
        attributes: {
          name,
          tags,
          ...customFields,
        },
        type: 'sequence',
      },
    };
  }
  return {
    data: {
      attributes: {
        name,
        tags,
        ...customFields,
      },
      relationships: {
        owner: {
          data: {
            id: parseInt(ownerId, 10),
            type: 'user',
          },
        },
      },
      type: 'sequence',
    },
  };
};

export const toOutreachSequenceStepCreateParams = ({
  sequenceId,
  intervalSeconds,
  date,
  order,
  type,
  taskNote,
  customFields,
}: SequenceStepCreateParams): Record<string, any> => {
  if (!sequenceId) {
    throw new BadRequestError('Sequence ID is required for Outreach step creation');
  }
  return {
    data: {
      attributes: {
        interval: intervalSeconds,
        date,
        stepType: type,
        taskNote,
        order: order ?? 0,
        ...customFields,
      },
      relationships: {
        sequence: {
          data: {
            id: parseInt(sequenceId),
            type: 'sequence',
          },
        },
      },
      type: 'sequenceStep',
    },
  };
};

export const toOutreachSequenceTemplateCreateParams = (
  { isReply }: SequenceStepCreateParams,
  sequenceStepId: number,
  templateId: number
): Record<string, any> => {
  return {
    data: {
      attributes: {
        isReply,
      },
      relationships: {
        sequenceStep: {
          data: {
            id: sequenceStepId,
            type: 'sequenceStep',
          },
        },
        template: {
          data: {
            id: templateId,
            type: 'template',
          },
        },
      },
      type: 'sequenceTemplate',
    },
  };
};

export const toOutreachTemplateCreateParams = ({
  name,
  body,
  subject,
  to,
  cc,
  bcc,
  customFields,
}: SequenceTemplateCreateParams): Record<string, any> => {
  return {
    data: {
      attributes: {
        name,
        bodyHtml: body,
        subject,
        toRecipients: to,
        ccRecipients: cc,
        bccRecipients: bcc,
        ...customFields,
      },
      type: 'template',
    },
  };
};

export const toOutreachProspectAddressParams = (address?: Address | null) => {
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
export const toOutreachProspectEmailParams = (emailAddresses?: EmailAddress[]) => {
  if (!emailAddresses) {
    return;
  }
  return {
    emails: emailAddresses?.map(({ emailAddress }) => emailAddress) ?? [],
  };
};

export const toOutreachProspectPhoneNumbers = (phoneNumbers?: PhoneNumber[]) => {
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
        case 'primary':
          // Defaulting to mobile phone for primary
          mobilePhones.push(phoneNumber);
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
