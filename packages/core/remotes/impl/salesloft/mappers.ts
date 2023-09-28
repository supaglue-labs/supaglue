import type {
  Account,
  AccountCreateParams,
  Contact,
  ContactCreateParams,
  EmailAddress,
  PhoneNumber,
  Sequence,
  SequenceCreateParams,
  SequenceState,
  SequenceStateCreateParams,
  SequenceStepCreateParams,
  User,
} from '@supaglue/types/engagement';
import { camelcaseKeys } from '@supaglue/utils';

export const fromSalesloftAccountToAccount = (record: Record<string, any>): Account => {
  return {
    id: record.id.toString(),
    name: record.name ?? null,
    domain: record.domain ?? null,
    ownerId: record.owner?.id?.toString() ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    lastModifiedAt: new Date(record.updated_at),
    isDeleted: false,
    rawData: record,
  };
};

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
    phoneNumbers: fromSalesloftPersonToPhoneNumbers(record),
    ownerId: record.owner?.id?.toString() ?? null,
    accountId: record.account?.id?.toString() ?? null,
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
      emailAddressType: 'primary',
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
      phoneNumberType: 'primary',
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

export const toSalesloftAccountCreateParams = (account: AccountCreateParams): Record<string, unknown> => {
  return {
    name: account.name,
    domain: account.domain,
    owner_id: account.ownerId ? parseInt(account.ownerId) : undefined,
  };
};

export const toSalesloftContactCreateParams = (contact: ContactCreateParams): Record<string, unknown> => {
  return {
    first_name: contact.firstName,
    last_name: contact.lastName,
    title: contact.jobTitle,
    city: contact.address?.city,
    state: contact.address?.state,
    country: contact.address?.country,
    email_address: contact.emailAddresses?.find((e) => e.emailAddressType === 'primary')?.emailAddress,
    personal_email_address: contact.emailAddresses?.find((e) => e.emailAddressType === 'personal')?.emailAddress,
    phone: contact.phoneNumbers?.find((e) => e.phoneNumberType === 'primary')?.phoneNumber,
    home_phone: contact.phoneNumbers?.find((e) => e.phoneNumberType === 'home')?.phoneNumber,
    mobile_phone: contact.phoneNumbers?.find((e) => e.phoneNumberType === 'mobile')?.phoneNumber,
    owner_id: contact.ownerId ? parseInt(contact.ownerId) : contact.ownerId,
    account_id: contact.accountId ? parseInt(contact.accountId) : contact.accountId,
    ...contact.customFields,
  };
};

export const toSalesloftSequenceStateCreateParams = (
  sequenceState: SequenceStateCreateParams
): Record<string, unknown> => {
  return {
    cadence_id: sequenceState.sequenceId,
    person_id: sequenceState.contactId,
    user_id: sequenceState.userId,
  };
};

/**
 * Issues:
 * - `ownerId` does not appear to be supported by salesloft
 */
export const toSalesloftCadenceImportParams = (sequence: SequenceCreateParams): CadenceImport => {
  return {
    settings: {
      name: sequence.name,
      target_daily_people: 0,
      cadence_function: 'outbound',
      remove_bounced: true,
      remove_replied: true,
      external_identifier: null,
    },
    sharing_settings: {
      team_cadence: sequence.type === 'team',
      shared: true, // the default when creating in the UI
    },
    cadence_content: {
      step_groups: [],
      ...sequence.customFields,
    },
  };
};

/**
 * Issues:
 * - `linkedin_send_message` is not natively supported
 * - No ability to use existing template ID
 */
export const toSalesloftCadenceStepImportParams = (seqStep: SequenceStepCreateParams): CadenceImport => {
  const step: Step | null =
    seqStep.type === 'manual_email' && 'body' in seqStep.template
      ? {
          enabled: true,
          type: 'Email',
          name: `Step ${seqStep.order}`,
          type_settings: {
            email_template: {
              title: seqStep.template.name,
              subject: seqStep.template.subject,
              body: seqStep.template.body,
            },
          },
        }
      : null;
  return {
    cadence_content: {
      cadence_id: parseInt(seqStep.sequenceId, 10),
      step_groups: [
        {
          day: 1, // What should this be?
          automated: false,
          due_immediately: false,
          steps: step ? [step] : [],
          reference_id: 0,
        },
      ],
      ...seqStep.customFields,
    },
  };
};

/** @see https://gist.github.com/tonyxiao/6e14c2348e4672e91257c0b918d5ccab */
interface CadenceImport {
  /** optional when cadence_content.cadence_id is specified */
  settings?: Settings;
  /** optional when cadence_content.cadence_id is specified */
  sharing_settings?: SharingSettings;
  cadence_content: {
    /** For importing */
    cadence_id?: number;
    step_groups: StepGroup[];
  };
}

interface Settings {
  name: string;
  target_daily_people: number;
  remove_replied: boolean;
  remove_bounced: boolean;
  remove_people_when_meeting_booked?: boolean;
  external_identifier: null | string | number;
  /** https://share.cleanshot.com/1JmgKzwV */
  cadence_function: 'outbound' | 'inbound' | 'event' | 'other';
}

interface SharingSettings {
  team_cadence: boolean;
  shared: boolean;
}

interface StepGroup {
  /** Collection of all the settings for an automated step. Only valid if automated is true. */
  automated_settings?: AutomatedSettings;
  /** Describes if the step happens with or without human intervention. Can only be true if steps in group are Email steps. */
  automated: boolean;
  /** The day that the step will be executed */
  day: number;
  /** Describes if the step is due immediately or not. */
  due_immediately: boolean;
  /** Used to correlate threaded email steps */
  reference_id?: number;
  /** All of the steps that belong to a particular day */
  steps: Step[];
}

/**
 * Represents the parameters for an automated action.
 */
interface AutomatedSettings {
  /** The time that the automated action will happen.*/
  time_of_day: string;

  /**
   * Specifies whether the email is sent after the person's timezone
   * or the user's timezone.
   * Must be either "person" or "user".
   */
  timezone_mode: 'person' | 'user';

  /**
   * Describes if the step is due immediately or not.
   * Must be either "at_time" or "after_time_delay".
   */
  send_type: 'at_time' | 'after_time_delay';

  /** Determines whether or not the step is able to be sent on weekends */
  allow_send_on_weekends: boolean;
}

type Step = {
  /** Describes if that step is currently enabled */
  enabled: boolean;
  /** The name given by the user for the step */
  name: string;
} & (
  | { type: 'Phone'; type_settings: { instructions: string } }
  | { type: 'Other'; type_settings: { instructions: string } }
  | {
      type: 'Integration';
      type_settings: {
        /** The instructions to follow when executing that step */
        instructions: string;
        /** Identifies the Salesloft integration you are trying to use */
        integration_id: number;
        /** For LinkedIn steps, identifies one of the LinkedIn Steps. */
        integration_step_type_guid: string;
      };
    }
  | {
      type: 'Email';
      type_settings: {
        /** Used to reference the step group of the previous email in a thread */
        previous_email_step_group_reference_id?: number;
        /** Content for the email template used in this step */
        email_template?: {
          title?: string;
          subject?: string;
          body?: string;
        };
      };
    }
);
