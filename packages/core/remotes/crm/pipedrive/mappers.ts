import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/base';
import type {
  OpportunityStatus,
  RemoteAccount,
  RemoteAccountCreateParams,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteLead,
  RemoteLeadCreateParams,
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteUser,
} from '@supaglue/types/crm';
import type { PipedriveRecord, PipelineStageMapping } from '.';
import { BadRequestError } from '../../../errors';

export const fromPipedrivePersonToRemoteContact = (person: PipedriveRecord): RemoteContact => {
  return {
    remoteId: person.id.toString(),
    firstName: person.first_name ?? null,
    lastName: person.last_name ?? null,
    addresses: [], // Pipedrive contacts do not have addresses
    emailAddresses: fromPipedriveEmailsToEmailAddresses(person.email),
    phoneNumbers: fromPipedrivePhonesToPhoneNumbers(person.phone),
    lifecycleStage: null,
    lastActivityAt: person.last_activity_date ? new Date(person.last_activity_date) : null,
    remoteOwnerId: person.owner_id?.id?.toString() ?? null,
    remoteAccountId: person.org_id?.value?.toString() ?? null,
    remoteCreatedAt: person.add_time ? new Date(person.add_time) : null,
    remoteUpdatedAt: person.update_time ? new Date(person.update_time) : null,
    remoteWasDeleted: !!person.delete_time,
    remoteDeletedAt: person.delete_time ? new Date(person.delete_time) : null,
    detectedOrRemoteDeletedAt: person.delete_time ? new Date(person.delete_time) : null,
    rawData: person,
  };
};

export const fromPipedriveLeadToRemoteLead = (lead: PipedriveRecord): RemoteLead => {
  return {
    remoteId: lead.id.toString(),
    leadSource: lead.source_name ?? null,
    title: lead.title ?? null,
    company: null,
    firstName: null,
    lastName: null,
    // Pipedrive leads don't have contact info
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
    remoteOwnerId: lead.owner_id?.toString() ?? null,
    convertedRemoteAccountId: lead.organization_id?.toString() ?? null,
    convertedRemoteContactId: lead.person_id?.toString() ?? null,
    convertedDate: null,
    remoteCreatedAt: lead.add_time ? new Date(lead.add_time) : null,
    remoteUpdatedAt: lead.update_time ? new Date(lead.update_time) : null,
    remoteWasDeleted: lead.is_archived ?? false,
    remoteDeletedAt: null,
    detectedOrRemoteDeletedAt: null,
    rawData: lead,
  };
};

export const fromPipedriveDealToRemoteOpportunity = (
  deal: PipedriveRecord,
  pipelineStageMapping: PipelineStageMapping
): RemoteOpportunity => {
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
    remoteId: deal.id.toString(),
    name: deal.title ?? null,
    description: null,
    amount: deal.value ?? null,
    stage,
    status: fromPipelineDealStatusToOpportunityStatus(deal.status),
    lastActivityAt: deal.last_activity_date ? new Date(deal.last_activity_date) : null,
    closeDate: deal.close_time ? new Date(deal.close_time) : null,
    pipeline,
    remoteOwnerId: deal.user_id?.id?.toString() ?? null,
    remoteAccountId: deal.org_id?.value?.toString() ?? null,
    remoteCreatedAt: deal.add_time ? new Date(deal.add_time) : null,
    remoteUpdatedAt: deal.update_time ? new Date(deal.update_time) : null,
    remoteWasDeleted: deal.deleted ?? false,
    remoteDeletedAt: deal.delete_time ? new Date(deal.delete_time) : null,
    detectedOrRemoteDeletedAt: deal.delete_time ? new Date(deal.delete_time) : null,
    rawData: deal,
  };
};

export const fromPipedriveOrganizationToRemoteAccount = (organization: PipedriveRecord): RemoteAccount => {
  return {
    remoteId: organization.id.toString(),
    name: organization.name ?? null,
    description: null,
    industry: null,
    website: null,
    numberOfEmployees: organization.people_count ?? null,
    addresses: fromPipedriveOrganizationToAddresses(organization),
    phoneNumbers: [],
    lastActivityAt: null,
    lifecycleStage: null,
    remoteOwnerId: organization.owner_id?.id?.toString() ?? null,
    remoteCreatedAt: organization.add_time ? new Date(organization.add_time) : null,
    remoteUpdatedAt: organization.update_time ? new Date(organization.update_time) : null,
    remoteWasDeleted: !!organization.delete_time,
    remoteDeletedAt: organization.delete_time ? new Date(organization.delete_time) : null,
    detectedOrRemoteDeletedAt: organization.delete_time ? new Date(organization.delete_time) : null,
    rawData: organization,
  };
};

export const fromPipedriveUserToRemoteUser = (user: PipedriveRecord): RemoteUser => {
  return {
    remoteId: user.id.toString(),
    name: user.name ?? null,
    email: user.email ?? null,
    isActive: user.active_flag ?? false,
    remoteCreatedAt: user.created ? new Date(user.created) : null,
    remoteUpdatedAt: user.modified ? new Date(user.modified) : null,
    remoteWasDeleted: false,
    remoteDeletedAt: null,
    detectedOrRemoteDeletedAt: null,
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

export const toPipedrivePersonCreateParams = (params: RemoteContactCreateParams) => {
  return {
    first_name: params.firstName,
    last_name: params.lastName,
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
    ...params.customFields,
  };
};

export const toPipedrivePersonUpdateParams = toPipedrivePersonCreateParams;

export const toPipedriveLeadCreateParams = (params: RemoteLeadCreateParams) => {
  if (!params.convertedAccountId && !params.convertedContactId) {
    throw new BadRequestError('Either convertedAccountId or convertedContactId must be provided');
  }
  return {
    title: params.title,
    owner_id: params.ownerId ? parseInt(params.ownerId) : undefined,
    person_id: params.convertedContactId ? parseInt(params.convertedContactId) : undefined,
    organization_id: params.convertedAccountId ? parseInt(params.convertedAccountId) : undefined,
    ...params.customFields,
  };
};
export const toPipedriveLeadUpdateParams = toPipedriveLeadCreateParams;

export const toPipedriveOrganizationCreateParams = (params: RemoteAccountCreateParams) => {
  return {
    name: params.name,
    owner_id: params.ownerId,
    ...params.customFields,
  };
};
export const toPipedriveOrganizationUpdateParams = toPipedriveOrganizationCreateParams;

const getPipelineId = (
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

const getStageId = (
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
  params: RemoteOpportunityCreateParams,
  pipelineStageMapping: PipelineStageMapping
) => {
  const pipelineId = getPipelineId(params.pipeline, pipelineStageMapping);
  const stageId = getStageId(pipelineId, params.stage, pipelineStageMapping);
  return {
    title: params.name,
    value: params.amount?.toString(),
    user_id: params.ownerId ? parseInt(params.ownerId) : undefined,
    org_id: params.accountId ? parseInt(params.accountId) : undefined,
    pipeline_id: pipelineId ? parseInt(pipelineId) : undefined,
    stage_id: stageId ? parseInt(stageId) : undefined,
    ...params.customFields,
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
