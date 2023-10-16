import type {
  Account,
  AccountCreateParams,
  Contact,
  ContactCreateParams,
  CustomFields,
  Lead,
  LeadCreateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityStatus,
  User,
} from '@supaglue/types/crm';
import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import type { PipedriveRecord, PipelineStageMapping } from '.';
import { BadRequestError } from '../../../errors';
import { maxDate } from '../../../lib';
import { getFullName } from '../../utils/name';
import type { PipedriveObjectField } from './types';

export const mapCustomFieldsFromNamesToKeys = (
  customFields: CustomFields,
  fields: PipedriveObjectField[]
): CustomFields => {
  const mappedCustomFields: CustomFields = {};
  for (const [name, value] of Object.entries(customFields)) {
    const field = fields.find((field) => field.name === name);
    if (!field) {
      throw new BadRequestError(`Field not found: ${name}`);
    }

    // Map the key
    const { key } = field;

    // Map the value if necessary
    if (field.field_type === 'enum' || field.field_type === 'set') {
      const option = field.options.find((option) => option.label === value);
      if (!option) {
        throw new BadRequestError(`Option ${value} not found for field ${name}`);
      }
      mappedCustomFields[key] = option.id;
    } else {
      mappedCustomFields[key] = value;
    }
  }
  return mappedCustomFields;
};

/**
 * Given a record and a list of fields:
 * 1. Identify the keys that are custom field keys.
 * 2. Rewrite the key with the name of the field.
 * 3. For fields that are enums or sets, rewrite the value with the corresponding label.
 *
 */
export const rewriteCustomFieldsInRecord = (
  record: PipedriveRecord,
  fields: PipedriveObjectField[]
): PipedriveRecord => {
  const mappedRecord: PipedriveRecord = {};

  for (const [key, value] of Object.entries(record)) {
    const field = fields.find((field) => field.key === key);
    if (!field) {
      mappedRecord[key] = value;
      continue;
    }

    // Map the name
    const { name } = field;

    // Map the value if necessary
    if (field.field_type === 'enum' || field.field_type === 'set') {
      const option = field.options.find((option) => option.id.toString() === value);
      if (option) {
        mappedRecord[name] = option.label;
      } else {
        // TODO: should we throw an error here if it's not null or undefined?
        mappedRecord[name] = value;
      }
    } else {
      mappedRecord[name] = value;
    }
  }

  return mappedRecord;
};

export const fromPipedrivePersonToContact = (person: PipedriveRecord, fields: PipedriveObjectField[]): Contact => {
  return {
    id: person.id.toString(),
    firstName: person.first_name ?? null,
    lastName: person.last_name ?? null,
    addresses: [], // Pipedrive contacts do not have addresses
    emailAddresses: fromPipedriveEmailsToEmailAddresses(person.email),
    phoneNumbers: fromPipedrivePhonesToPhoneNumbers(person.phone),
    lifecycleStage: null,
    lastActivityAt: person.last_activity_date ? new Date(person.last_activity_date) : null,
    ownerId: person.owner_id?.id?.toString() ?? null,
    accountId: person.org_id?.value?.toString() ?? null,
    createdAt: person.add_time ? new Date(person.add_time) : null,
    updatedAt: person.update_time ? new Date(person.update_time) : null,
    isDeleted: !!person.delete_time,
    lastModifiedAt: maxDate(
      person.delete_time ? new Date(person.delete_time) : null,
      person.update_time ? new Date(person.update_time) : null
    ),
    rawData: rewriteCustomFieldsInRecord(person, fields),
  };
};

export const fromPipedriveLeadToLead = (lead: PipedriveRecord, fields: PipedriveObjectField[]): Lead => {
  return {
    id: lead.id.toString(),
    leadSource: lead.source_name ?? null,
    title: lead.title ?? null,
    company: null,
    firstName: null,
    lastName: null,
    // Pipedrive leads don't have contact info
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
    ownerId: lead.owner_id?.toString() ?? null,
    convertedAccountId: lead.organization_id?.toString() ?? null,
    convertedContactId: lead.person_id?.toString() ?? null,
    convertedDate: null,
    createdAt: lead.add_time ? new Date(lead.add_time) : null,
    updatedAt: lead.update_time ? new Date(lead.update_time) : null,
    isDeleted: lead.is_archived ?? false,
    lastModifiedAt: maxDate(lead.update_time ? new Date(lead.update_time) : null), // TODO: how to know when deleted?
    rawData: rewriteCustomFieldsInRecord(lead, fields),
  };
};

export const fromPipedriveDealToOpportunity = (
  deal: PipedriveRecord,
  pipelineStageMapping: PipelineStageMapping,
  fields: PipedriveObjectField[]
): Opportunity => {
  let pipeline = deal.pipeline_id?.toString() ?? null;
  let stage = deal.stage_id?.toString() ?? null;

  if (pipeline && pipelineStageMapping[pipeline]) {
    const pipelineId = pipeline;
    pipeline = pipelineStageMapping[pipeline].label;
    if (stage && pipelineStageMapping[pipelineId].stageIdsToLabels[stage]) {
      stage = pipelineStageMapping[pipelineId].stageIdsToLabels[stage];
    }
  }
  return {
    id: deal.id.toString(),
    name: deal.title ?? null,
    description: null,
    amount: deal.value ?? null,
    stage,
    status: fromPipelineDealStatusToOpportunityStatus(deal.status),
    lastActivityAt: deal.last_activity_date ? new Date(deal.last_activity_date) : null,
    closeDate: deal.close_time ? new Date(deal.close_time) : null,
    pipeline,
    ownerId: deal.user_id?.id?.toString() ?? null,
    accountId: deal.org_id?.value?.toString() ?? null,
    createdAt: deal.add_time ? new Date(deal.add_time) : null,
    updatedAt: deal.update_time ? new Date(deal.update_time) : null,
    isDeleted: deal.deleted ?? false,
    lastModifiedAt: maxDate(
      deal.update_time ? new Date(deal.update_time) : null,
      deal.delete_time ? new Date(deal.delete_time) : null
    ),
    rawData: rewriteCustomFieldsInRecord(deal, fields),
  };
};

export const fromPipedriveOrganizationToAccount = (
  organization: PipedriveRecord,
  fields: PipedriveObjectField[]
): Account => {
  return {
    id: organization.id.toString(),
    name: organization.name ?? null,
    description: null,
    industry: null,
    website: null,
    numberOfEmployees: organization.people_count ?? null,
    addresses: fromPipedriveOrganizationToAddresses(organization),
    phoneNumbers: [],
    lastActivityAt: null,
    lifecycleStage: null,
    ownerId: organization.owner_id?.id?.toString() ?? null,
    createdAt: organization.add_time ? new Date(organization.add_time) : null,
    updatedAt: organization.update_time ? new Date(organization.update_time) : null,
    isDeleted: !!organization.delete_time,
    lastModifiedAt: maxDate(
      organization.update_time ? new Date(organization.update_time) : null,
      organization.delete_time ? new Date(organization.delete_time) : null
    ),
    rawData: rewriteCustomFieldsInRecord(organization, fields),
  };
};

export const fromPipedriveUserToUser = (user: PipedriveRecord): User => {
  return {
    id: user.id.toString(),
    name: user.name ?? null,
    email: user.email ?? null,
    isActive: user.active_flag ?? false,
    createdAt: user.created ? new Date(user.created) : null,
    updatedAt: user.modified ? new Date(user.modified) : null,
    isDeleted: false,
    lastModifiedAt: maxDate(user.modified ? new Date(user.modified) : null), // TODO: how to know when deleted?
    rawData: user,
  };
};

export const fromPipedriveEmailsToEmailAddresses = (emails: { label: string; value: string }[]): EmailAddress[] => {
  return emails
    .filter(({ label }) => label === 'work' || label === 'primary')
    .map((email) => ({ emailAddress: email.value, emailAddressType: email.label } as EmailAddress));
};

export const fromPipedrivePhonesToPhoneNumbers = (phoneNumbers: { label: string; value: string }[]): PhoneNumber[] => {
  return phoneNumbers
    .filter(({ label }) => label === 'mobile' || label === 'primary' || label === 'fax')
    .map((phoneNumber) => ({ phoneNumber: phoneNumber.value, phoneNumberType: phoneNumber.label } as PhoneNumber));
};

export const fromPipedriveOrganizationToAddresses = (organization: PipedriveRecord): Address[] => {
  if (
    !organization.address_street_number &&
    !organization.address_route &&
    !organization.address_subpremise &&
    !organization.address_locality &&
    !organization.address_admin_area_level_1 &&
    !organization.address_postal_code &&
    !organization.address_country
  ) {
    return [];
  }
  return [
    {
      street1: organization.address_street_number
        ? `${organization.address_street_number ?? ''} ${organization.address_route ?? ''}`
        : organization.address_route ?? null,
      street2: organization.address_subpremise ?? null,
      city: organization.address_locality ?? null,
      state: organization.address_admin_area_level_1 ?? null,
      postalCode: organization.address_postal_code ?? null,
      country: organization.address_country ?? null,
      addressType: 'primary',
    },
  ];
};

export const toPipedrivePersonCreateParams = (params: ContactCreateParams, fields: PipedriveObjectField[]) => {
  const name = getFullName(params.firstName, params.lastName);
  if (!name) {
    throw new BadRequestError('Either firstName or lastName must be provided');
  }
  return toPipedrivePersonUpdateParams(params, fields);
};

export const toPipedrivePersonUpdateParams = (params: ContactCreateParams, fields: PipedriveObjectField[]) => {
  const name = getFullName(params.firstName, params.lastName);
  const mappedCustomFields = params.customFields
    ? mapCustomFieldsFromNamesToKeys(params.customFields, fields)
    : undefined;
  return {
    name: name === null ? undefined : name,
    email: params.emailAddresses?.map(({ emailAddress, emailAddressType }) => ({
      label: emailAddressType,
      value: emailAddress,
    })),
    phone: params.phoneNumbers?.map(({ phoneNumber, phoneNumberType }) => ({
      value: phoneNumber,
      label: phoneNumberType,
    })),
    org_id: params.accountId ? parseInt(params.accountId) : undefined,
    owner_id: params.ownerId ? parseInt(params.ownerId) : undefined,
    ...mappedCustomFields,
  };
};

export const toPipedriveLeadCreateParams = (params: LeadCreateParams, fields: PipedriveObjectField[]) => {
  if (!params.convertedAccountId && !params.convertedContactId) {
    throw new BadRequestError('Either converted_account_id or converted_contact_id must be provided');
  }
  return toPipedriveLeadUpdateParams(params, fields);
};

export const toPipedriveLeadUpdateParams = (params: LeadCreateParams, fields: PipedriveObjectField[]) => {
  const mappedCustomFields = params.customFields
    ? mapCustomFieldsFromNamesToKeys(params.customFields, fields)
    : undefined;
  return {
    title: params.title,
    owner_id: params.ownerId ? parseInt(params.ownerId) : undefined,
    person_id: params.convertedContactId ? parseInt(params.convertedContactId) : undefined,
    organization_id: params.convertedAccountId ? parseInt(params.convertedAccountId) : undefined,
    ...mappedCustomFields,
  };
};

export const toPipedriveOrganizationCreateParams = (params: AccountCreateParams, fields: PipedriveObjectField[]) => {
  const mappedCustomFields = params.customFields
    ? mapCustomFieldsFromNamesToKeys(params.customFields, fields)
    : undefined;
  return {
    name: params.name,
    owner_id: params.ownerId,
    ...mappedCustomFields,
  };
};
export const toPipedriveOrganizationUpdateParams = toPipedriveOrganizationCreateParams;

export const getPipelineId = (
  pipelineNameOrId: string | null | undefined,
  pipelineStageMapping: PipelineStageMapping
): string | null => {
  if (!pipelineNameOrId) {
    return null;
  }
  if (pipelineStageMapping[pipelineNameOrId]) {
    return pipelineNameOrId;
  }
  const entry = Object.entries(pipelineStageMapping).find(([, { label }]) => label === pipelineNameOrId);
  if (entry) {
    return entry[0];
  }
  throw new BadRequestError(`Pipeline not found: ${pipelineNameOrId}`);
};

export const getStageId = (
  pipelineId: string | null,
  stageNameOrId: string | undefined | null,
  pipelineStageMapping: PipelineStageMapping
): string | null => {
  if (!pipelineId || !stageNameOrId) {
    return null;
  }
  if (!pipelineStageMapping[pipelineId]) {
    throw new BadRequestError(`Pipeline not found: ${pipelineId}`);
  }
  const stageMapping = pipelineStageMapping[pipelineId].stageIdsToLabels;
  if (stageMapping[stageNameOrId]) {
    return stageNameOrId;
  }
  const entry = Object.entries(stageMapping).find(([, label]) => label === stageNameOrId);
  if (entry) {
    return entry[0];
  }
  throw new BadRequestError(`Stage not found: ${stageNameOrId}`);
};

export const toPipedriveDealCreateParams = (
  params: OpportunityCreateParams,
  pipelineStageMapping: PipelineStageMapping,
  fields: PipedriveObjectField[]
) => {
  const pipelineId = getPipelineId(params.pipeline, pipelineStageMapping);
  const stageId = getStageId(pipelineId, params.stage, pipelineStageMapping);
  const mappedCustomFields = params.customFields
    ? mapCustomFieldsFromNamesToKeys(params.customFields, fields)
    : undefined;
  return {
    title: params.name,
    value: params.amount?.toString(),
    user_id: params.ownerId ? parseInt(params.ownerId) : undefined,
    org_id: params.accountId ? parseInt(params.accountId) : undefined,
    pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
    stage_id: stageId ? parseInt(stageId) : undefined,
    ...mappedCustomFields,
  };
};
export const toPipedriveDealUpdateParams = toPipedriveDealCreateParams;

export const fromPipelineDealStatusToOpportunityStatus = (
  dealStatus: 'open' | 'won' | 'lost' | 'deleted' | null
): OpportunityStatus | null => {
  switch (dealStatus) {
    case 'open':
      return 'OPEN';
    case 'won':
      return 'WON';
    case 'lost':
      return 'LOST';
    default:
      return null;
  }
};
