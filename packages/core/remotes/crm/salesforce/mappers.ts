import {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  Address,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  EmailAddress,
  Event,
  EventCreateParams,
  EventUpdateParams,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityStatus,
  OpportunityUpdateParams,
  PhoneNumber,
  User,
} from '@supaglue/types/crm';

const CONTACT_ID_PREFIX = '003';
const LEAD_ID_PREFIX = '00Q';

export const fromSalesforceUserToUser = (record: Record<string, any>): User => {
  return {
    id: record.Id,
    name: record.Name,
    email: record.Email,
    isActive: record.IsActive,
    // These fields are not supported by Salesforce
    createdAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    updatedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    wasDeleted: record.IsDeleted === 'true',
    deletedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
  };
};

export const fromSalesforceEventToEvent = (record: Record<string, any>): Event => {
  // In SFDC, WhoId can refer to either a contact or a lead
  const contactId = (record.WhoId ?? '').startsWith(CONTACT_ID_PREFIX) ? record.WhoId : null;
  const leadId = (record.WhoId ?? '').startsWith(LEAD_ID_PREFIX) ? record.WhoId : null;
  return {
    id: record.Id,
    subject: record.Subject ?? null,
    // TODO: Type is not turned on by default in SFDC instances. We should have a way to turn it on.
    type: record.Type ?? null,
    // content is not supported in salesforce events
    content: null,
    startTime: record.StartDateTime ? new Date(record.StartDateTime) : null,
    endTime: record.EndDateTime ? new Date(record.EndDateTime) : null,
    ownerId: record.OwnerId ?? null,
    accountId: record.AccountId,
    contactId,
    leadId,
    opportunityId: null,
    // These fields are not supported by Salesforce
    createdAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    updatedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    wasDeleted: false,
    deletedAt: null,
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
  };
};

export const toSalesforceEventCreateParams = (params: EventCreateParams) => {
  return {
    Subject: params.subject,
    OwnerId: params.ownerId,
    AccountId: params.accountId,
    WhoId: params.contactId || params.leadId,
    StartDateTime: params.startTime,
    EndDateTime: params.endTime,
    ...params.customFields,
  };
};

export const toSalesforceEventUpdateParams = (params: EventUpdateParams) => {
  return {
    Id: params.id,
    ...toSalesforceEventCreateParams(params),
  };
};

export const fromSalesforceAccountToAccount = (record: Record<string, any>): Account => {
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
    id: record.Id,
    name: record.Name,
    description: record.Description ?? null,
    ownerId: record.OwnerId ?? null,
    industry: record.Industry ?? null,
    website: record.Website ?? null,
    numberOfEmployees: record.NumberOfEmployees ? parseInt(record.NumberOfEmployees) : null,
    addresses,
    phoneNumbers,
    // lifecycle stage is not supported in salesforce
    lifecycleStage: null,
    // Figure out where this comes from
    lastActivityAt: record.LastActivityDate ? new Date(record.LastActivityDate) : null,
    createdAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    updatedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    wasDeleted: record.IsDeleted === 'true',
    deletedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
  };
};

export const toSalesforceAccountCreateParams = (params: AccountCreateParams) => {
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

export const toSalesforceAccountUpdateParams = (params: AccountUpdateParams) => {
  return {
    Id: params.id,
    ...toSalesforceAccountCreateParams(params),
  };
};

export const fromSalesforceContactToContact = (record: Record<string, any>): Contact => {
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
    id: record.Id,
    accountId: record.AccountId ?? null,
    ownerId: record.OwnerId ?? null,
    firstName: record.FirstName ?? null,
    lastName: record.LastName ?? null,
    addresses,
    emailAddresses: record.Email ? [{ emailAddress: record.Email, emailAddressType: 'primary' }] : [],
    phoneNumbers,
    // lifecycle stage is not supported in salesforce
    lifecycleStage: null,
    lastActivityAt: record.LastActivityDate ? new Date(record.LastActivityDate) : null,
    createdAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    updatedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    wasDeleted: record.IsDeleted === 'true',
    deletedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
  };
};

export const toSalesforceContactCreateParams = (params: ContactCreateParams) => {
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

export const toSalesforceContactUpdateParams = (params: ContactUpdateParams) => {
  return {
    Id: params.id,
    ...toSalesforceContactCreateParams(params),
  };
};

export const fromSalesforceLeadToLead = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: Record<string, any>
): Lead => {
  return {
    id: record.Id,
    firstName: record.FirstName ?? null,
    lastName: record.LastName ?? null,
    ownerId: record.OwnerId ?? null,
    title: record.Title ?? null,
    company: record.Company ?? null,
    convertedDate: record.ConvertedDate ? new Date(record.ConvertedDate) : null,
    leadSource: record.LeadSource ?? null,
    // TODO: support associated fields
    convertedAccountId: record.ConvertedAccountId ?? null,
    convertedContactId: record.ConvertedContactId ?? null,
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
    createdAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    updatedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    wasDeleted: record.IsDeleted === 'true',
    deletedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
  };
};

export const toSalesforceLeadCreateParams = (params: LeadCreateParams) => {
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

export const toSalesforceLeadUpdateParams = (params: LeadUpdateParams) => {
  return {
    Id: params.id,
    ...toSalesforceLeadCreateParams(params),
  };
};

export const fromSalesforceOpportunityToOpportunity = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: Record<string, any>
): Opportunity => {
  let status: OpportunityStatus = 'OPEN';
  if (record.IsWon === 'true') {
    status = 'WON';
  } else if (record.IsClosed === 'true') {
    status = 'LOST';
  }
  return {
    id: record.Id,
    name: record.Name,
    description: record.Description ?? null,
    ownerId: record.OwnerId ?? null,
    status,
    stage: record.StageName,
    closeDate: record.CloseDate ? new Date(record.CloseDate) : null,
    accountId: record.AccountId ?? null,
    // pipeline is not supported in salesforce
    pipeline: null,
    amount: record.Amount ? parseInt(record.Amount) : null,
    lastActivityAt: record.LastActivityDate ? new Date(record.LastActivityDate) : null,
    createdAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    updatedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    wasDeleted: record.IsDeleted === 'true',
    deletedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
  };
};

export const toSalesforceOpportunityCreateParams = (params: OpportunityCreateParams) => {
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

export const toSalesforceOpportunityUpdateParams = (params: OpportunityUpdateParams) => {
  return {
    Id: params.id,
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
