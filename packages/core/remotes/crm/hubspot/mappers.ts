import { SimplePublicObjectWithAssociations as HubSpotCompany } from '@hubspot/api-client/lib/codegen/crm/companies';
import { SimplePublicObjectWithAssociations as HubSpotContact } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { SimplePublicObjectWithAssociations as HubSpotDeal } from '@hubspot/api-client/lib/codegen/crm/deals';
import { PublicOwner as HubspotOwner } from '@hubspot/api-client/lib/codegen/crm/owners';
import {
  Address,
  EmailAddress,
  OpportunityStatus,
  PhoneNumber,
  RemoteAccount,
  RemoteAccountCreateParams,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteUser,
} from '../../../types';

export const fromHubSpotCompanyToRemoteAccount = ({
  id,
  properties,
  createdAt,
  updatedAt,
}: HubSpotCompany): RemoteAccount => {
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
    remoteId: id,
    name: properties.name ?? null,
    description: properties.description ?? null,
    remoteOwnerId: properties.hubspot_owner_id ?? null,
    industry: properties.industry ?? null,
    website: properties.website ?? null,
    numberOfEmployees: properties.numberofemployees ? parseInt(properties.numberofemployees) : null,
    addresses,
    phoneNumbers,
    // Figure out where this comes from
    lastActivityAt: properties.notes_last_updated ? new Date(properties.notes_last_updated) : null,
    remoteCreatedAt: createdAt,
    remoteUpdatedAt: updatedAt,
    remoteWasDeleted: false,
  };
};

export const fromHubSpotContactToRemoteContact = ({
  id,
  properties,
  createdAt,
  updatedAt,
  associations,
}: HubSpotContact): RemoteContact => {
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
  let remoteAccountId = null;
  if (associations?.companies?.results?.length) {
    remoteAccountId = associations.companies.results[0].id ?? null;
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

  return {
    remoteId: id,
    remoteAccountId,
    remoteOwnerId: properties.hubspot_owner_id ?? null,
    firstName: properties.firstname ?? null,
    lastName: properties.lastname ?? null,
    addresses,
    phoneNumbers,
    emailAddresses,
    lastActivityAt: properties.notes_last_updated ? new Date(properties.notes_last_updated) : null,
    remoteCreatedAt: createdAt,
    remoteUpdatedAt: updatedAt,
    remoteWasDeleted: false,
  };
};

export const fromHubSpotDealToRemoteOpportunity = ({
  id,
  properties,
  createdAt,
  updatedAt,
  associations,
}: HubSpotDeal): RemoteOpportunity => {
  let status: OpportunityStatus = 'OPEN';
  if (properties.hs_is_closed_won) {
    status = 'WON';
  } else if (properties.hs_is_closed === 'true') {
    status = 'LOST';
  }
  let remoteAccountId = null;
  if (associations?.companies?.results?.length) {
    remoteAccountId = associations.companies.results[0].id ?? null;
  }
  return {
    remoteId: id,
    name: properties.dealname ?? null,
    description: properties.description ?? null,
    remoteOwnerId: properties.hubspot_owner_id ?? null,
    lastActivityAt: properties.notes_last_updated ? new Date(properties.notes_last_updated) : null,
    remoteCreatedAt: createdAt,
    remoteUpdatedAt: updatedAt,
    status,
    remoteAccountId,
    amount: properties.amount ? parseInt(properties.amount) : null,
    closeDate: properties.closedate ? new Date(properties.closedate) : null,
    stage: properties.dealstage,
    remoteWasDeleted: false,
  };
};

export const fromHubspotOwnerToRemoteUser = ({
  id,
  firstName,
  lastName,
  archived,
  email,
  createdAt,
  updatedAt,
}: HubspotOwner): RemoteUser => {
  return {
    remoteId: id,
    name: getFullName(firstName, lastName),
    email: email ?? null,
    isActive: !archived,
    remoteCreatedAt: createdAt,
    remoteUpdatedAt: updatedAt,
    remoteWasDeleted: false,
  };
};

const getFullName = (firstName?: string, lastName?: string): string | null => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  return null;
};

export const toHubspotAccountCreateParams = (params: RemoteAccountCreateParams): Record<string, string> => {
  const phoneParams = toHubspotPhoneCreateParams(params.phoneNumbers);
  return {
    name: params.name ?? '',
    industry: params.industry ?? '',
    description: params.description ?? '',
    website: params.website ?? '',
    numberofemployees: params.numberOfEmployees?.toString() ?? '',
    phone: phoneParams.phone, // only primary phone is supported for hubspot accounts
    hubspot_owner_id: params.ownerId ?? '',
    ...toHubspotAddressCreateParams(params.addresses),
    ...params.customFields,
  };
};

export const toHubspotAccountUpdateParams = toHubspotAccountCreateParams;

export const toHubspotOpportunityCreateParams = (params: RemoteOpportunityCreateParams): Record<string, string> => {
  return {
    amount: params.amount?.toString() ?? '',
    closedate: params.closeDate?.toISOString() ?? '',
    dealname: params.name ?? '',
    description: params.description ?? '',
    dealstage: params.stage ?? '',
    hubspot_owner_id: params.ownerId ?? '',
    ...params.customFields,
  };
};
export const toHubspotOpportunityUpdateParams = toHubspotOpportunityCreateParams;

export const toHubspotContactCreateParams = (params: RemoteContactCreateParams): Record<string, string> => {
  return {
    firstname: params.firstName ?? '',
    lastname: params.lastName ?? '',
    hubspot_owner_id: params.ownerId ?? '',
    ...toHubspotEmailCreateParams(params.emailAddresses),
    ...toHubspotPhoneCreateParams(params.phoneNumbers),
    ...toHubspotAddressCreateParams(params.addresses),
    ...params.customFields,
  };
};

const toHubspotEmailCreateParams = (emailAddresses?: EmailAddress[]): Record<string, string> => {
  if (!emailAddresses) {
    return {};
  }
  const primaryEmail = emailAddresses.find(({ emailAddressType }) => emailAddressType === 'primary');
  const workEmail = emailAddresses.find(({ emailAddressType }) => emailAddressType === 'work');
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
  return {
    phone: primaryPhone?.phoneNumber ?? '',
    mobile: mobilePhone?.phoneNumber ?? '',
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
    address2: primary?.street2 ?? '',
    city: primary?.city ?? '',
    state: primary?.state ?? '',
    zip: primary?.postalCode ?? '',
    country: primary?.country ?? '',
  };
};
export const toHubspotContactUpdateParams = toHubspotContactCreateParams;
