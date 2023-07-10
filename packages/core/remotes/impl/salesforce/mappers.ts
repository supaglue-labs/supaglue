import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityStatus,
  OpportunityUpdateParams,
  User,
} from '@supaglue/types/crm';
import type { SGObject } from '@supaglue/types/crm/association_type';
import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import type { CustomObject } from '@supaglue/types/crm/custom_object';
import type { CustomObject as SalesforceCustomObject } from 'jsforce/lib/api/metadata';

export const fromObjectToSalesforceObject = (object: SGObject): string => {
  switch (object.originType) {
    case 'standard':
    case 'custom':
      return object.id;
    case 'common':
      switch (object.id) {
        case 'account':
          return 'Account';
        case 'contact':
          return 'Contact';
        case 'opportunity':
          return 'Opportunity';
        case 'lead':
          return 'Lead';
        default:
          throw new Error(`Unknown common object: ${object.id}`);
      }
  }
};

export function getMapperForCommonObjectType<T extends CRMCommonObjectType>(
  commonObjectType: T
): (record: Record<string, unknown>) => CRMCommonObjectTypeMap<T>['object'] {
  switch (commonObjectType) {
    case 'account':
      return fromSalesforceAccountToAccount;
    case 'contact':
      return fromSalesforceContactToContact;
    case 'lead':
      return fromSalesforceLeadToLead;
    case 'opportunity':
      return fromSalesforceOpportunityToOpportunity;
    case 'user':
      return fromSalesforceUserToUser;
    default:
      throw new Error(`Unsupported common object type: ${commonObjectType}`);
  }
}

export const fromSalesforceUserToUser = (record: Record<string, any>): User => {
  return {
    id: record.Id,
    name: record.Name,
    email: record.Email,
    isActive: record.IsActive,
    // These fields are not supported by Salesforce
    createdAt: record.CreatedDate ? new Date(record.CreatedDate) : null,
    updatedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : null,
    isDeleted: record.IsDeleted === 'true',
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
    rawData: record,
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
    isDeleted: record.IsDeleted === 'true',
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
    rawData: record,
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
    isDeleted: record.IsDeleted === 'true',
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
    rawData: record,
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
    isDeleted: record.IsDeleted === 'true',
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
    rawData: record,
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
    isDeleted: record.IsDeleted === 'true',
    lastModifiedAt: record.SystemModstamp ? new Date(record.SystemModstamp) : new Date(0),
    rawData: record,
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

export const toCustomObject = (salesforceCustomObject: SalesforceCustomObject): CustomObject => {
  if (!salesforceCustomObject.fullName) {
    throw new Error(`unexpectedly, custom object missing fullName; custom object may not exist`);
  }

  if (!salesforceCustomObject.nameField || !salesforceCustomObject.nameField.label) {
    throw new Error(`unexpectedly, custom object missing nameField`);
  }

  // TODO: We should map things to "unknown" if we don't know, or pass the original
  // value through
  if (salesforceCustomObject.nameField.type !== 'Text') {
    throw new Error(`unexpectedly, custom object not of type Text`);
  }

  if (!salesforceCustomObject.label) {
    throw new Error(`unexpectedly, custom object missing label`);
  }

  if (!salesforceCustomObject.pluralLabel) {
    throw new Error(`unexpectedly, custom object missing pluralLabel`);
  }

  return {
    id: salesforceCustomObject.fullName,
    name: salesforceCustomObject.fullName,
    description: typeof salesforceCustomObject.description === 'string' ? salesforceCustomObject.description : null,
    labels: {
      singular: salesforceCustomObject.label,
      plural: salesforceCustomObject.pluralLabel,
    },
    primaryFieldKeyName: 'Name',
    fields: [
      {
        keyName: 'Name',
        displayName: salesforceCustomObject.nameField.label,
        fieldType: 'string',
        isRequired: true,
      },
      ...salesforceCustomObject.fields.flatMap((field) => {
        if (!field.fullName) {
          throw new Error(`unexpectedly, custom object field missing fullName`);
        }

        if (!field.label) {
          throw new Error(`unexpectedly, custom object field ${field.fullName} missing label`);
        }

        // TODO: maybe introduce an 'unknown' value for enum

        // If the field is lookup, we deal with that in the Association Types / Associations API instead
        // TODO: Should we support it here too?
        if (field.type === 'Lookup') {
          return [];
        }

        if (field.type !== 'Text' && field.type !== 'Number') {
          throw new Error(`unexpectedly, custom object field ${field.fullName} has unsupported type ${field.type}`);
        }

        if (field.required === null || field.required === undefined) {
          throw new Error(`unexpectedly, custom object field ${field.fullName} is missing required property`);
        }

        return {
          keyName: field.fullName,
          displayName: field.label,
          fieldType: field.type === 'Text' ? ('string' as const) : ('number' as const),
          isRequired: field.required,
        };
      }),
    ],
  };
};
