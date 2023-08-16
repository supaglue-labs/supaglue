import type { SimplePublicObjectWithAssociations as HubSpotCompany } from '@hubspot/api-client/lib/codegen/crm/companies';
import type { SimplePublicObjectWithAssociations as HubSpotContact } from '@hubspot/api-client/lib/codegen/crm/contacts';
import type { SimplePublicObjectWithAssociations as HubSpotDeal } from '@hubspot/api-client/lib/codegen/crm/deals';
import type { PublicOwner as HubspotOwner } from '@hubspot/api-client/lib/codegen/crm/owners';
import type {
  Account,
  AccountCreateParams,
  Contact,
  ContactCreateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityStatus,
  User,
} from '@supaglue/types/crm';
import type { Address, EmailAddress, LifecycleStage, PhoneNumber } from '@supaglue/types/crm/common';
import type { StandardOrCustomObject } from '@supaglue/types/standard_or_custom_object';
import type { PipelineStageMapping } from '.';
import { BadRequestError } from '../../../errors';
import { maxDate, removeUndefinedValues } from '../../../lib';
import { getFullName } from '../../utils/name';

export const fromObjectToHubspotObjectType = (object: StandardOrCustomObject): string => {
  return object.name;
};

export const fromHubSpotCompanyToAccount = ({
  id,
  properties,
  createdAt,
  updatedAt,
  archived,
  archivedAt,
}: HubSpotCompany): Account => {
  const addresses: Address[] =
    properties.address ||
    properties.address2 ||
    properties.city ||
    properties.state ||
    properties.zip ||
    properties.country
      ? [
          {
            street1: properties.address ?? null,
            street2: properties.address2 ?? null,
            city: properties.city ?? null,
            state: properties.state ?? null,
            postalCode: properties.zip ?? null,
            country: properties.country ?? null,
            addressType: 'primary',
          },
        ]
      : [];

  const phoneNumbers: PhoneNumber[] = properties.phone
    ? [
        {
          phoneNumber: properties.phone ?? null,
          phoneNumberType: 'primary',
        },
      ]
    : [];

  return {
    id,
    name: properties.name ?? null,
    description: properties.description ?? null,
    ownerId: properties.hubspot_owner_id ?? null,
    industry: properties.industry ?? null,
    website: properties.website ?? null,
    numberOfEmployees: properties.numberofemployees ? parseInt(properties.numberofemployees) : null,
    addresses,
    phoneNumbers,
    lifecycleStage: (properties.lifecyclestage as LifecycleStage) ?? null,
    // Figure out where this comes from
    lastActivityAt: properties.notes_last_updated ? new Date(properties.notes_last_updated) : null,
    createdAt: createdAt,
    updatedAt: updatedAt,
    isDeleted: !!archived,
    lastModifiedAt: maxDate(updatedAt, archivedAt),
    rawData: properties,
  };
};

export const fromHubSpotContactToContact = ({
  id,
  properties,
  createdAt,
  updatedAt,
  associations,
  archived,
  archivedAt,
}: HubSpotContact): Contact => {
  const emailAddresses = [
    properties.email
      ? {
          emailAddress: properties.email,
          emailAddressType: 'primary',
        }
      : null,
    properties.work_email
      ? {
          emailAddress: properties.work_email,
          emailAddressType: 'work',
        }
      : null,
  ].filter(Boolean) as EmailAddress[];
  let accountId = null;
  if (associations?.companies?.results?.length) {
    accountId = associations.companies.results[0].id ?? null;
  }

  const phoneNumbers = [
    properties.phone
      ? {
          phoneNumber: properties.phone,
          phoneNumberType: 'primary',
        }
      : null,
    properties.mobilePhone
      ? {
          phoneNumber: properties.mobilePhone,
          phoneNumberType: 'mobile',
        }
      : null,
    properties.fax
      ? {
          phoneNumber: properties.fax,
          phoneNumberType: 'fax',
        }
      : null,
  ].filter(Boolean) as PhoneNumber[];

  const addresses: Address[] =
    properties.address || properties.city || properties.state || properties.zip || properties.country
      ? [
          {
            street1: properties.address ?? null,
            street2: null,
            city: properties.city ?? null,
            state: properties.state ?? null,
            postalCode: properties.zip ?? null,
            country: properties.country ?? null,
            addressType: 'primary',
          },
        ]
      : [];

  return {
    id,
    accountId,
    ownerId: properties.hubspot_owner_id ?? null,
    firstName: properties.firstname ?? null,
    lastName: properties.lastname ?? null,
    addresses,
    phoneNumbers,
    emailAddresses,
    lifecycleStage: (properties.lifecyclestage as LifecycleStage) ?? null,
    lastActivityAt: properties.notes_last_updated ? new Date(properties.notes_last_updated) : null,
    createdAt: createdAt,
    updatedAt: updatedAt,
    isDeleted: !!archived,
    lastModifiedAt: maxDate(updatedAt, archivedAt),
    rawData: properties,
  };
};

export const fromHubSpotDealToOpportunity = (
  { id, properties, createdAt, updatedAt, associations, archived, archivedAt }: HubSpotDeal,
  pipelineStageMapping: PipelineStageMapping
): Opportunity => {
  let status: OpportunityStatus = 'OPEN';
  if (properties.hs_is_closed_won === 'true') {
    status = 'WON';
  } else if (properties.hs_is_closed === 'true') {
    status = 'LOST';
  }
  let accountId = null;
  if (associations?.companies?.results?.length) {
    accountId = associations.companies.results[0].id ?? null;
  }

  let pipeline = properties.pipeline ?? null;
  let stage = properties.dealstage ?? null;

  if (pipeline && pipelineStageMapping[pipeline]) {
    const pipelineId = pipeline;
    pipeline = pipelineStageMapping[pipeline].label;
    if (stage && pipelineStageMapping[pipelineId].stageIdsToLabels[stage]) {
      stage = pipelineStageMapping[pipelineId].stageIdsToLabels[stage];
    }
  }

  return {
    id,
    name: properties.dealname ?? null,
    description: properties.description ?? null,
    ownerId: properties.hubspot_owner_id ?? null,
    lastActivityAt: properties.notes_last_updated ? new Date(properties.notes_last_updated) : null,
    status,
    pipeline,
    accountId,
    amount: properties.amount ? parseInt(properties.amount) : null,
    closeDate: properties.closedate ? new Date(properties.closedate) : null,
    stage,
    createdAt: createdAt,
    updatedAt: updatedAt,
    isDeleted: !!archived,
    lastModifiedAt: maxDate(updatedAt, archivedAt),
    rawData: properties,
  };
};

export const fromHubspotOwnerToUser = ({
  id,
  firstName,
  lastName,
  email,
  createdAt,
  updatedAt,
  archived,
  userId,
  teams,
}: HubspotOwner): User => {
  return {
    id,
    name: getFullName(firstName, lastName),
    email: email ?? null,
    isActive: !archived,
    createdAt: createdAt,
    updatedAt: updatedAt,
    isDeleted: !!archived,
    lastModifiedAt: updatedAt, // TODO: How do we find out when the user was deleted?
    rawData: {
      // List of fields comes from `HubspotOwner`, which is a class, not an object
      id,
      firstName,
      lastName,
      email,
      createdAt,
      updatedAt,
      archived,
      userId,
      teams,
    },
  };
};

export const toHubspotAccountCreateParams = (params: AccountCreateParams): Record<string, string> => {
  const phoneParams = toHubspotPhoneCreateParams(params.phoneNumbers);
  const out = {
    name: nullToEmptyString(params.name),
    industry: nullToEmptyString(params.industry),
    description: nullToEmptyString(params.description),
    website: nullToEmptyString(params.website),
    numberofemployees: nullToEmptyString(params.numberOfEmployees?.toString()),
    phone: phoneParams.phone, // only primary phone is supported for hubspot accounts
    lifecyclestage: nullToEmptyString(params.lifecycleStage),
    hubspot_owner_id: nullToEmptyString(params.ownerId),
    ...toHubspotAddressCreateParams(params.addresses),
    ...params.customFields,
  };
  removeUndefinedValues(out);
  return out as Record<string, string>;
};

export const toHubspotAccountUpdateParams = toHubspotAccountCreateParams;

const getPipelineId = (
  pipelineNameOrId: string | null | undefined,
  pipelineStageMapping: PipelineStageMapping
): string | null | undefined => {
  if (pipelineNameOrId === undefined) {
    return undefined;
  }
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
  pipelineId: string | null | undefined,
  stageNameOrId: string | undefined | null,
  pipelineStageMapping: PipelineStageMapping
): string | null | undefined => {
  if (pipelineId === undefined || stageNameOrId === undefined) {
    return undefined;
  }
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

export const toHubspotOpportunityCreateParams = (
  params: OpportunityCreateParams,
  pipelineStageMapping: PipelineStageMapping
): Record<string, string> => {
  const pipelineId = getPipelineId(params.pipeline, pipelineStageMapping);
  const stageId = getStageId(pipelineId, params.stage, pipelineStageMapping);
  const out = {
    amount: nullToEmptyString(params.amount?.toString()),
    closedate: nullToEmptyString(params.closeDate?.toISOString()),
    dealname: nullToEmptyString(params.name),
    description: nullToEmptyString(params.description),
    dealstage: nullToEmptyString(stageId),
    pipeline: nullToEmptyString(pipelineId),
    hubspot_owner_id: nullToEmptyString(params.ownerId),
    ...params.customFields,
  };
  removeUndefinedValues(out);
  return out as Record<string, string>;
};
export const toHubspotOpportunityUpdateParams = toHubspotOpportunityCreateParams;

export const toHubspotContactCreateParams = (params: ContactCreateParams): Record<string, string> => {
  const out = {
    firstname: nullToEmptyString(params.firstName),
    lastname: nullToEmptyString(params.lastName),
    hubspot_owner_id: nullToEmptyString(params.ownerId),
    lifecyclestage: nullToEmptyString(params.lifecycleStage),
    ...toHubspotEmailCreateParams(params.emailAddresses),
    ...toHubspotPhoneCreateParams(params.phoneNumbers),
    ...toHubspotAddressCreateParams(params.addresses),
    ...params.customFields,
  };
  removeUndefinedValues(out);
  return out as Record<string, string>;
};

const toHubspotEmailCreateParams = (emailAddresses?: EmailAddress[]): Record<string, string> => {
  if (!emailAddresses) {
    return {};
  }
  const primaryEmail = emailAddresses.find(({ emailAddressType }) => emailAddressType === 'primary');
  const workEmail = emailAddresses.find(({ emailAddressType }) => emailAddressType === 'work');
  // Explicitly null-out other emails if they don't exist.
  return {
    email: primaryEmail?.emailAddress ?? '',
    work_email: workEmail?.emailAddress ?? '',
  };
};

const toHubspotPhoneCreateParams = (phoneNumbers?: PhoneNumber[]): Record<string, string> => {
  if (!phoneNumbers) {
    return {};
  }
  const primaryPhone = phoneNumbers.find(({ phoneNumberType }) => phoneNumberType === 'primary');
  const mobilePhone = phoneNumbers.find(({ phoneNumberType }) => phoneNumberType === 'mobile');
  const faxPhone = phoneNumbers.find(({ phoneNumberType }) => phoneNumberType === 'fax');
  // Explicitly null-out other phones if they don't exist.
  return {
    phone: primaryPhone?.phoneNumber ?? '',
    mobilephone: mobilePhone?.phoneNumber ?? '',
    fax: faxPhone?.phoneNumber ?? '',
  };
};

const toHubspotAddressCreateParams = (addresses?: Address[]): Record<string, string> => {
  if (!addresses) {
    return {};
  }
  const primary = addresses.find(({ addressType }) => addressType === 'primary');
  return {
    address: primary?.street1 ?? '',
    // TODO: Support address2 for companies only
    city: primary?.city ?? '',
    state: primary?.state ?? '',
    zip: primary?.postalCode ?? '',
    country: primary?.country ?? '',
  };
};
export const toHubspotContactUpdateParams = toHubspotContactCreateParams;

export const nullToEmptyString = (value: string | undefined | null): string | undefined => {
  return value === null ? '' : value;
};
