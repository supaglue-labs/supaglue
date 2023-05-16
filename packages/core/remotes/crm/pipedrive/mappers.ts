import {
  OpportunityStatus,
  RemoteAccount,
  RemoteContact,
  RemoteLead,
  RemoteOpportunity,
  RemoteUser,
} from '@supaglue/types/crm';
import { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import { PipedriveRecord, PipelineStageMapping } from '.';

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
    addresses: [fromPipedriveOrganizationToAddress(organization)],
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

export const fromPipedriveOrganizationToAddress = (organization: PipedriveRecord): Address => {
  return {
    street1: `${organization.address_street_number ?? ''} ${organization.address_route ?? ''}`,
    street2: organization.address_subpremise ?? null,
    city: organization.address_locality ?? null,
    state: organization.address_admin_area_level_1 ?? null,
    postalCode: organization.address_postal_code ?? null,
    country: organization.address_country ?? null,
    addressType: 'primary',
  };
};

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
