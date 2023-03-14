import {
  Address,
  BILLING_ADDRESS_TYPE,
  FAX_PHONE_NUMBER_TYPE,
  MAILING_ADDRESS_TYPE,
  OpportunityStatus,
  OTHER_ADDRESS_TYPE,
  PhoneNumber,
  RemoteAccount,
  RemoteAccountCreateParams,
  RemoteAccountUpdateParams,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteContactUpdateParams,
  RemoteLead,
  RemoteLeadCreateParams,
  RemoteLeadUpdateParams,
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteOpportunityUpdateParams,
  SHIPPING_ADDRESS_TYPE,
} from '../../../types';

export const fromSalesforceAccountToRemoteAccount = (record: Record<string, any>): RemoteAccount => {
  const billingAddress: Address | null =
    record.BillingCity ||
    record.BillingCountry ||
    record.BillingPostalCode ||
    record.BillingState ||
    record.BillingStreet
      ? {
          street1: record.BillingStreet ?? null,
          street2: null,
          city: record.BillingCity ?? null,
          state: record.BillingState ?? null,
          postalCode: record.postalCode ?? null,
          country: record.country ?? null,
          addressType: BILLING_ADDRESS_TYPE,
        }
      : null;

  const shippingAddress: Address | null =
    record.ShippingCity ||
    record.ShippingCountry ||
    record.ShippingPostalCode ||
    record.ShippingState ||
    record.ShippingStreet
      ? {
          street1: record.ShippingStreet ?? null,
          street2: null,
          city: record.ShippingCity ?? null,
          state: record.ShippingState ?? null,
          postalCode: record.postalCode ?? null,
          country: record.country ?? null,
          addressType: SHIPPING_ADDRESS_TYPE,
        }
      : null;

  const addresses = [billingAddress, shippingAddress].filter((address): address is Address => !!address);

  const phoneNumber: PhoneNumber | null = record.Phone
    ? {
        phoneNumber: record.Phone,
        phoneNumberType: null,
      }
    : null;
  const faxPhoneNumber: PhoneNumber | null = record.Fax
    ? {
        phoneNumber: record.Fax,
        phoneNumberType: FAX_PHONE_NUMBER_TYPE,
      }
    : null;

  const phoneNumbers = [phoneNumber, faxPhoneNumber].filter((phoneNumber): phoneNumber is PhoneNumber => !!phoneNumber);

  return {
    remoteId: record.Id,
    name: record.Name,
    description: record.Description ?? null,
    remoteOwnerId: record.OwnerId ?? null,
    industry: record.Industry ?? null,
    website: record.Website ?? null,
    numberOfEmployees: record.NumberOfEmployees ? parseInt(record.NumberOfEmployees) : null,
    addresses,
    phoneNumbers,
    // Figure out where this comes from
    lastActivityAt: record.LastActivityDate ? new Date(record.LastActivityDate) : null,
    remoteCreatedAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    remoteUpdatedAt: record.LastModifiedDate ? new Date(record.LastModifiedDate) : null,
    remoteWasDeleted: record.IsDeleted === 'true' ?? false,
  };
};

export const toSalesforceAccountCreateParams = (params: RemoteAccountCreateParams) => {
  return {
    Name: params.name,
    Description: params.description,
    Industry: params.industry,
    Website: params.website,
    NumberOfEmployees: params.numberOfEmployees,
  };
};

export const toSalesforceAccountUpdateParams = (params: RemoteAccountUpdateParams) => {
  return {
    Id: params.remoteId,
    ...toSalesforceAccountCreateParams(params),
  };
};

export const fromSalesforceContactToRemoteContact = (record: Record<string, any>): RemoteContact => {
  const mailingAddress: Address | null =
    record.MailingCity ||
    record.MailingCountry ||
    record.MailingPostalCode ||
    record.MailingState ||
    record.MailingStreet
      ? {
          street1: record.MailingStreet ?? null,
          street2: null,
          city: record.MailingCity ?? null,
          state: record.MailingState ?? null,
          postalCode: record.MailingPostalCode ?? null,
          country: record.MailingCountry ?? null,
          addressType: MAILING_ADDRESS_TYPE,
        }
      : null;

  const otherAddress: Address | null =
    record.OtherCity || record.OtherCountry || record.OtherPostalCode || record.OtherState || record.OtherStreet
      ? {
          street1: record.OtherStreet ?? null,
          street2: null,
          city: record.OtherCity ?? null,
          state: record.OtherState ?? null,
          postalCode: record.OtherPostalCode ?? null,
          country: record.OtherCountry ?? null,
          addressType: OTHER_ADDRESS_TYPE,
        }
      : null;

  const addresses = [mailingAddress, otherAddress].filter((address): address is Address => !!address);

  const phoneNumbers: PhoneNumber[] = [];
  if (record.Phone) {
    phoneNumbers.push({
      phoneNumber: record.Phone,
      phoneNumberType: 'primary',
    });
  }

  if (record.MobilePhone) {
    phoneNumbers.push({
      phoneNumber: record.MobilePhone,
      phoneNumberType: 'mobile',
    });
  }

  if (record.HomePhone) {
    phoneNumbers.push({
      phoneNumber: record.HomePhone,
      phoneNumberType: 'home',
    });
  }

  if (record.AssistantPhone) {
    phoneNumbers.push({
      phoneNumber: record.AssistantPhone,
      phoneNumberType: 'assistant',
    });
  }

  if (record.OtherPhone) {
    phoneNumbers.push({
      phoneNumber: record.OtherPhone,
      phoneNumberType: 'other',
    });
  }

  if (record.Fax) {
    phoneNumbers.push({
      phoneNumber: record.Fax,
      phoneNumberType: 'fax',
    });
  }

  return {
    remoteId: record.Id,
    remoteAccountId: record.AccountId ?? null,
    remoteOwnerId: record.OwnerId ?? null,
    firstName: record.FirstName ?? null,
    lastName: record.LastName ?? null,
    addresses,
    emailAddresses: [{ emailAddress: record.Email, emailAddressType: null }],
    phoneNumbers,
    lastActivityAt: record.LastActivityDate ? new Date(record.LastActivityDate) : null,
    remoteCreatedAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    remoteUpdatedAt: record.LastModifiedDate ? new Date(record.LastModifiedDate) : null,
    remoteWasDeleted: record.IsDeleted === 'true' ?? false,
  };
};

export const toSalesforceContactCreateParams = (params: RemoteContactCreateParams) => {
  return {
    FirstName: params.firstName,
    LastName: params.lastName,
    AccountId: params.accountId,
  };
};

export const toSalesforceContactUpdateParams = (params: RemoteContactUpdateParams) => {
  return {
    Id: params.remoteId,
    ...toSalesforceContactCreateParams(params),
  };
};

export const fromSalesforceLeadToRemoteLead = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: Record<string, any>
): RemoteLead => {
  return {
    remoteId: record.Id,
    firstName: record.FirstName ?? null,
    lastName: record.LastName ?? null,
    remoteOwnerId: record.OwnerId ?? null,
    title: record.Title ?? null,
    company: record.Company ?? null,
    convertedDate: record.ConvertedDate ? new Date(record.ConvertedDate) : null,
    leadSource: record.LeadSource ?? null,
    // TODO: support associated fields
    convertedRemoteAccountId: record.ConvertedAccountId ?? null,
    convertedRemoteContactId: record.ConvertedContactId ?? null,
    addresses: [
      {
        street1: record.Street ?? null,
        street2: null,
        city: record.City ?? null,
        state: record.State ?? null,
        country: record.Country ?? null,
        postalCode: record.PostalCode ?? null,
        addressType: null,
      },
    ],
    emailAddresses: [{ emailAddress: record.Email, emailAddressType: null }],
    phoneNumbers: [
      {
        phoneNumber: record.Phone ?? null,
        phoneNumberType: null,
      },
    ],
    remoteCreatedAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    remoteUpdatedAt: record.LastModifiedDate ? new Date(record.LastModifiedDate) : null,
    remoteWasDeleted: record.IsDeleted === 'true' ?? false,
  };
};

export const toSalesforceLeadCreateParams = (params: RemoteLeadCreateParams) => {
  return {
    FirstName: params.firstName,
    LastName: params.lastName,
    Title: params.title,
    LeadSource: params.leadSource,
    Company: params.company,
  };
};

export const toSalesforceLeadUpdateParams = (params: RemoteLeadUpdateParams) => {
  return {
    Id: params.remoteId,
    ...toSalesforceLeadCreateParams(params),
  };
};

export const fromSalesforceOpportunityToRemoteOpportunity = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: Record<string, any>
): RemoteOpportunity => {
  let status: OpportunityStatus = 'OPEN';
  if (record.IsWon === 'true') {
    status = 'WON';
  } else if (record.IsClosed === 'true') {
    status = 'LOST';
  }
  return {
    remoteId: record.Id,
    name: record.Name,
    description: record.Description ?? null,
    remoteOwnerId: record.OwnerId ?? null,
    status,
    stage: record.StageName,
    closeDate: record.CloseDate ? new Date(record.CloseDate) : null,
    remoteAccountId: record.AccountId ?? null,
    amount: record.Amount ? parseInt(record.Amount) : null,
    lastActivityAt: record.LastActivityDate ? new Date(record.LastActivityDate) : null,
    remoteCreatedAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    remoteUpdatedAt: record.LastModifiedDate ? new Date(record.LastModifiedDate) : null,
    remoteWasDeleted: record.IsDeleted === 'true' ?? false,
  };
};

export const toSalesforceOpportunityCreateParams = (params: RemoteOpportunityCreateParams) => {
  return {
    Amount: params.amount,
    CloseDate: params.closeDate,
    Description: params.description,
    Name: params.name,
    StageName: params.stage,
    AccountId: params.accountId,
  };
};

export const toSalesforceOpportunityUpdateParams = (params: RemoteOpportunityUpdateParams) => {
  return {
    Id: params.remoteId,
    ...toSalesforceOpportunityCreateParams(params),
  };
};
