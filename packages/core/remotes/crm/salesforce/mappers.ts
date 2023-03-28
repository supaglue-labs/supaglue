import {
  Address,
  EmailAddress,
  OpportunityStatus,
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
  RemoteUser,
} from '../../../types';

export const fromSalesforceUserToRemoteUser = (record: Record<string, any>): RemoteUser => {
  return {
    remoteId: record.Id,
    name: record.Name,
    email: record.Email,
    isActive: record.IsActive,
    remoteWasDeleted: false,
    // These fields are not supported by Salesforce
    remoteCreatedAt: record.CreatedDate,
    remoteUpdatedAt: record.SystemModStamp,
  };
};

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
          addressType: 'billing',
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
          addressType: 'shipping',
        }
      : null;

  const addresses = [billingAddress, shippingAddress].filter((address): address is Address => !!address);

  const phoneNumber: PhoneNumber | null = record.Phone
    ? {
        phoneNumber: record.Phone,
        phoneNumberType: 'primary',
      }
    : null;
  const faxPhoneNumber: PhoneNumber | null = record.Fax
    ? {
        phoneNumber: record.Fax,
        phoneNumberType: 'fax',
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
    remoteUpdatedAt: record.SystemModStam ? new Date(record.SystemModStam) : null,
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
    ...toSalesforceAccountAddressCreateParams(params.addresses),
    ...toSalesforceAccountPhoneCreateParams(params.phoneNumbers),
    ...params.customFields,
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
          addressType: 'mailing',
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
          addressType: 'other',
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
    emailAddresses: record.Email ? [{ emailAddress: record.Email, emailAddressType: 'primary' }] : [],
    phoneNumbers,
    lastActivityAt: record.LastActivityDate ? new Date(record.LastActivityDate) : null,
    remoteCreatedAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    remoteUpdatedAt: record.SystemModStam ? new Date(record.SystemModStam) : null,
    remoteWasDeleted: record.IsDeleted === 'true' ?? false,
  };
};

export const toSalesforceContactCreateParams = (params: RemoteContactCreateParams) => {
  return {
    FirstName: params.firstName,
    LastName: params.lastName,
    AccountId: params.accountId,
    ...toSalesforceEmailCreateParams(params.emailAddresses),
    ...toSalesforceContactAddressCreateParams(params.addresses),
    ...toSalesforceContactPhoneCreateParams(params.phoneNumbers),
    ...params.customFields,
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
        addressType: 'primary',
      },
    ],
    emailAddresses: record.Email ? [{ emailAddress: record.Email, emailAddressType: 'primary' }] : [],
    phoneNumbers: record.Phone
      ? [
          {
            phoneNumber: record.Phone ?? null,
            phoneNumberType: 'primary',
          },
        ]
      : [],
    remoteCreatedAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    remoteUpdatedAt: record.SystemModStam ? new Date(record.SystemModStam) : null,
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
    ...toSalesforceEmailCreateParams(params.emailAddresses),
    ...toSalesforceLeadAddressCreateParams(params.addresses),
    ...params.customFields,
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
    remoteUpdatedAt: record.SystemModStam ? new Date(record.SystemModStam) : null,
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
    ...params.customFields,
  };
};

export const toSalesforceOpportunityUpdateParams = (params: RemoteOpportunityUpdateParams) => {
  return {
    Id: params.remoteId,
    ...toSalesforceOpportunityCreateParams(params),
  };
};

const toSalesforceAccountAddressCreateParams = (addresses?: Address[]): Record<string, string> => {
  if (!addresses) {
    return {};
  }
  const shipping = addresses.find(({ addressType }) => addressType === 'shipping');
  const billing = addresses.find(({ addressType }) => addressType === 'billing');
  return {
    ShippingStreet: shipping?.street1 ?? '',
    ShippingCity: shipping?.city ?? '',
    ShippingState: shipping?.state ?? '',
    ShippingPostalCode: shipping?.postalCode ?? '',
    ShippingCountry: shipping?.country ?? '',
    BillingStreet: billing?.street1 ?? '',
    BillingCity: billing?.city ?? '',
    BillingState: billing?.state ?? '',
    BillingPostalCode: billing?.postalCode ?? '',
    BillingCountry: billing?.country ?? '',
  };
};

const toSalesforceContactAddressCreateParams = (addresses?: Address[]): Record<string, string> => {
  if (!addresses) {
    return {};
  }
  const mailing = addresses.find(({ addressType }) => addressType === 'mailing');
  const other = addresses.find(({ addressType }) => addressType === 'other');
  return {
    MailingStreet: mailing?.street1 ?? '',
    MailingCity: mailing?.city ?? '',
    MailingState: mailing?.state ?? '',
    MailingPostalCode: mailing?.postalCode ?? '',
    MailingCountry: mailing?.country ?? '',
    OtherStreet: other?.street1 ?? '',
    OtherCity: other?.city ?? '',
    OtherState: other?.state ?? '',
    OtherPostalCode: other?.postalCode ?? '',
    OtherCountry: other?.country ?? '',
  };
};

const toSalesforceLeadAddressCreateParams = (addresses?: Address[]): Record<string, string> => {
  if (!addresses) {
    return {};
  }
  const primary = addresses.find(({ addressType }) => addressType === 'primary');
  return {
    Street: primary?.street1 ?? '',
    City: primary?.city ?? '',
    State: primary?.state ?? '',
    Zip: primary?.postalCode ?? '',
    Country: primary?.country ?? '',
  };
};

const toSalesforceAccountPhoneCreateParams = (phoneNumbers?: PhoneNumber[]): Record<string, string> => {
  if (!phoneNumbers) {
    return {};
  }
  const primary = phoneNumbers.find(({ phoneNumberType }) => phoneNumberType === 'primary');
  const fax = phoneNumbers.find(({ phoneNumberType }) => phoneNumberType === 'fax');
  return {
    Phone: primary?.phoneNumber ?? '',
    Fax: fax?.phoneNumber ?? '',
  };
};

const toSalesforceContactPhoneCreateParams = (phoneNumbers?: PhoneNumber[]): Record<string, string> => {
  if (!phoneNumbers) {
    return {};
  }
  const mobile = phoneNumbers.find(({ phoneNumberType }) => phoneNumberType === 'mobile');
  return {
    ...toSalesforceAccountPhoneCreateParams(phoneNumbers),
    MobilePhone: mobile?.phoneNumber ?? '',
  };
};

const toSalesforceEmailCreateParams = (emailAddresses?: EmailAddress[]): Record<string, string> => {
  if (!emailAddresses) {
    return {};
  }
  const primary = emailAddresses.find(({ emailAddressType }) => emailAddressType === 'primary');
  return {
    Email: primary?.emailAddress ?? '',
  };
};
