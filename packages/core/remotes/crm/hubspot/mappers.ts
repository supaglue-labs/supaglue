import { SimplePublicObjectWithAssociations as HubSpotCompany } from '@hubspot/api-client/lib/codegen/crm/companies';
import { SimplePublicObjectWithAssociations as HubSpotContact } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { SimplePublicObjectWithAssociations as HubSpotDeal } from '@hubspot/api-client/lib/codegen/crm/deals';
import {
  EmailAddress,
  OpportunityStatus,
  PhoneNumber,
  RemoteAccount,
  RemoteAccountCreateParams,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
} from '../../../types';

export const fromHubSpotCompanyToRemoteAccount = ({
  id,
  properties,
  createdAt,
  updatedAt,
}: HubSpotCompany): RemoteAccount => {
  const addresses =
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
            addressType: null,
          },
        ]
      : [];

  const phoneNumbers = properties.phone
    ? [
        {
          phoneNumber: properties.phone ?? null,
          phoneNumberType: null,
        },
      ]
    : [];

  return {
    remoteId: id,
    name: properties.name ?? null,
    description: properties.description ?? null,
    owner: properties.hubspot_owner_id ?? null,
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

  // TODO: Handle hs_additional_emails
  // if (properties.hs_additional_emails?.length) {
  //   properties.hs_additional_emails.forEach((email) => {
  //     emailAddresses.push({ emailAddress: email, emailAddressType: null });
  //   });
  // }

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
    properties.hs_whatsapp_phone_number
      ? {
          phoneNumber: properties.hs_whatsapp_phone_number,
          phoneNumberType: 'whatsapp',
        }
      : null,
    properties.fax
      ? {
          phoneNumber: properties.fax,
          phoneNumberType: 'fax',
        }
      : null,
  ].filter(Boolean) as PhoneNumber[];

  const addresses =
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
            addressType: null,
          },
        ]
      : [];

  return {
    remoteId: id,
    remoteAccountId,
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
    owner: properties.hubspot_owner_id ?? null,
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

export const toHubspotAccountCreateParams = (params: RemoteAccountCreateParams): Record<string, string> => {
  return {
    name: params.name ?? '',
    industry: params.industry ?? '',
    description: params.description ?? '',
    website: params.website ?? '',
    numberofemployees: params.numberOfEmployees?.toString() ?? '',
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
  };
};
export const toHubspotOpportunityUpdateParams = toHubspotOpportunityCreateParams;

export const toHubspotContactCreateParams = (params: RemoteContactCreateParams): Record<string, string> => {
  return {
    firstname: params.firstName ?? '',
    lastname: params.lastName ?? '',
  };
};
export const toHubspotContactUpdateParams = toHubspotContactCreateParams;
