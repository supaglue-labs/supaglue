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
import { BadRequestError } from '../../../errors';
import type { components } from './salesloft.openapi.gen';

export type Salesloft = components['schemas'];
type SequenceStep = NonNullable<Sequence['steps']>[number];

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

export const fromSalesloftUserToUser = (record: Salesloft['User']): User => {
  return {
    id: record.id!.toString(),
    firstName: record.first_name ?? null,
    lastName: record.last_name ?? null,
    email: record.email ?? null,
    createdAt: new Date(record.created_at!),
    updatedAt: new Date(record.updated_at!),
    lastModifiedAt: new Date(record.updated_at!),
    isDeleted: false,
    rawData: record,
    isLocked: record.active,
  };
};

export const fromSalesloftCadenceToSequence = (
  record: Salesloft['Cadence'],
  stepCount: number,
  cadenceExport?: Salesloft['CadenceExport']
): Sequence => {
  const steps = cadenceExport?.cadence_content.step_groups.flatMap((group) =>
    group.steps.map((s) => fromSalesloftCadenceStepToSequenceStep(s, group))
  );
  return {
    id: record.id!.toString(),
    name: record.name ?? null,
    isEnabled: !record.draft,
    numSteps: stepCount,
    metrics: camelcaseKeys(record.counts ?? {}!),
    tags: record.tags ?? []!,
    ownerId: record.owner?.id?.toString() ?? null,
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
    lastModifiedAt: new Date(record.updated_at),
    isDeleted: !!record.archived_at,
    rawData: record,
    isArchived: record.current_state === 'archived',
    shareType: record.shared ? 'team' : 'private',
    steps,
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
export const toSalesloftCadenceImportParams = (sequence: SequenceCreateParams): Salesloft['CadenceImport'] => {
  const stepGroups: Salesloft['StepGroup'][] = [];
  let dayOffset = 0; // salesloft day is always relative to start of the sequence, so we account for that here
  for (const [index, step] of (sequence.steps ?? []).entries()) {
    // salesloft does not have a concept of step groups within their UI
    // and in fact seems to create a group for every step anyways... So we will replicate the same behavior
    const group = toSalesloftCadenceStepImportParams({
      ...step,
      order: index + 1,
      intervalSeconds: (step.intervalSeconds ?? 0) + dayOffset * 86400,
    }).cadence_content.step_groups[0];
    dayOffset = group.day - 1;
    stepGroups.push(group);
  }

  return {
    ...(sequence.customFields ?? {}), // settings and sharing_settings are specifically extracted below
    settings: {
      name: sequence.name,
      target_daily_people: 0,
      cadence_function: 'outbound',
      remove_bounced: true,
      remove_replied: true,
      external_identifier: null,
      ...(sequence.customFields?.settings ?? {}),
    },
    sharing_settings: {
      team_cadence: sequence.type === 'team',
      shared: true, // the default when creating in the UI
      ...(sequence.customFields?.sharing_settings ?? {}),
    },
    cadence_content: { step_groups: stepGroups },
  };
};

/**
 * Issues:
 * - `linkedin_send_message` is not natively supported
 * - No ability to use existing template ID
 * - Step group vs. steps
 * - date / interval based sequences vs. day based sequences
 * - Differentiate between auto-email vs. manual email
 * - Only works if a cadence has exactly 0 steps... https://share.cleanshot.com/dVx6sqTD
 */
export const toSalesloftCadenceStepImportParams = (step: SequenceStepCreateParams): Salesloft['CadenceImport'] => {
  if (step.date) {
    throw new BadRequestError('Only relative delays are supported for Salesloft sequences');
  }

  const day = (step.intervalSeconds ?? 0) / 86400 + 1;
  if (!Number.isInteger(day)) {
    throw new BadRequestError('Salesloft only supports intervals in whole days (i.e. multiples of 86400)');
  }

  const delayInMins = Math.floor(((step.intervalSeconds ?? 0) % 86400) / 60);

  if (delayInMins > 720) {
    throw new BadRequestError('Salesloft only supports delays up to 720 minutes within a day');
  }

  if (step.type === 'linkedin_send_message') {
    // Not clear how to implement this at the moment. We need
    // integration_id and integration_step_type_guid for this to work and it is quite Salesloft specific
    // @see https://share.cleanshot.com/BY66pmLW
    throw new BadRequestError('LinkedIn steps are not currently supported for Salesloft sequences');
  }
  if (step.template && 'id' in step.template) {
    throw new BadRequestError('Template IDs are not currently supported for Salesloft sequences');
  }

  const cadenceStep: Salesloft['Step'] | null =
    (step.type === 'manual_email' || step.type === 'auto_email') && step.template && 'body' in step.template
      ? {
          enabled: true,
          type: 'Email',
          name: [step.name ?? `Step ${step.order}`, step.taskNote].filter((n) => !!n).join(': '),
          type_settings: {
            email_template: { title: step.template.name, subject: step.template.subject, body: step.template.body },
          },
        }
      : step.type === 'call'
        ? {
            enabled: true,
            type: 'Phone',
            name: step.name ?? `Step ${step.order}`,
            type_settings: { instructions: step.taskNote ?? '' },
          }
        : {
            enabled: true,
            type: 'Other',
            name: step.name ?? `Step ${step.order}`,
            type_settings: { instructions: `${step.type}: ${step.taskNote ?? ''}` },
          };

  return {
    cadence_content: {
      cadence_id: step.sequenceId ? parseInt(step.sequenceId, 10) : undefined,
      step_groups: [
        {
          day,
          automated: step.type === 'auto_email',
          automated_settings:
            step.type === 'auto_email' ? { send_type: 'after_time_delay', delay_time: delayInMins } : undefined,
          due_immediately: false,
          steps: cadenceStep ? [cadenceStep] : [],
          reference_id: step.order ?? null,
        },
      ],
      ...step.customFields,
    },
  };
};

function fromSalesloftCadenceStepToSequenceStep(
  cadenceStep: Salesloft['Step'],
  group: Salesloft['StepGroup']
): SequenceStep {
  const step: Omit<SequenceStep, 'type'> = {
    id: undefined, // Cadence step export does NOT contain id...
    name: cadenceStep.name,
    intervalSeconds: group.day
      ? // Delay time is in minutes
        (group.day - 1) * 86400 + (group.automated_settings?.delay_time ?? 0) * 60
      : undefined,
  };
  if (cadenceStep.type === 'Email') {
    return {
      ...step,
      type: group.automated ? 'auto_email' : 'manual_email',
      template: {
        name: cadenceStep.type_settings.email_template?.title,
        subject: cadenceStep.type_settings.email_template?.subject ?? '',
        body: cadenceStep.type_settings.email_template?.body ?? '',
      },
    };
  }
  if (cadenceStep.type === 'Phone') {
    return {
      ...step,
      type: 'call',
      taskNote: cadenceStep.type_settings.instructions,
    };
  }
  return {
    name: cadenceStep.name,
    type: 'task',
    taskNote: cadenceStep.type_settings.instructions,
  };
}
