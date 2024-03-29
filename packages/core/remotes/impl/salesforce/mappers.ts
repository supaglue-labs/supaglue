import type { PropertyType, PropertyUnified } from '@supaglue/types';
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
import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import type { CustomObjectSchema } from '@supaglue/types/custom_object';
import type { Field } from 'jsforce';
import type {
  CustomField as SalesforceCustomField,
  CustomObject as SalesforceCustomObject,
} from 'jsforce/lib/api/metadata/schema';
import { BadRequestError } from '../../../errors';

type ToolingAPIValueSet = {
  restricted: boolean;
  valueSetDefinition: {
    sorted: boolean;
    value: { label: string; valueName: string; description: string }[];
  };
};
type ToolingAPICustomField = {
  FullName: string;
  Metadata: (
    | {
        type: 'DateTime' | 'Url' | 'Checkbox' | 'Date';
      }
    | {
        type: 'Text' | 'TextArea';
        length: number;
      }
    | {
        type: 'Number';
        precision: number;
        scale: number;
      }
    | {
        type: 'MultiselectPicklist';
        valueSet: ToolingAPIValueSet;
        visibleLines: number;
      }
    | {
        type: 'Picklist';
        valueSet: ToolingAPIValueSet;
      }
  ) & {
    required: boolean;
    label: string;
    description?: string;
    defaultValue: string | null;
  };
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
          postalCode: record.BillingPostalCode ?? null,
          country: record.BillingCountry ?? null,
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
          postalCode: record.ShippingPostalCode ?? null,
          country: record.ShippingCountry ?? null,
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
    addresses:
      record.Street || record.City || record.State || record.Country || record.PostalCode
        ? [
            {
              street1: record.Street ?? null,
              street2: null,
              city: record.City ?? null,
              state: record.State ?? null,
              country: record.Country ?? null,
              postalCode: record.PostalCode ?? null,
              addressType: 'primary',
            },
          ]
        : [],
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
    // TODO: This should be parseFloat, but we need to migrate our customers
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

export const toSalesforceAccountAddressCreateParams = (addresses?: Address[]): Record<string, string> => {
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

export const toSalesforceContactAddressCreateParams = (addresses?: Address[]): Record<string, string> => {
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

export const toCustomObject = (salesforceCustomObject: SalesforceCustomObject): CustomObjectSchema => {
  const { nameField } = salesforceCustomObject;
  if (!nameField) {
    throw new Error(`unexpectedly, custom object missing nameField`);
  }
  return {
    name: salesforceCustomObject.fullName!,
    description: salesforceCustomObject.description ?? null,
    labels: {
      singular: salesforceCustomObject.label!,
      plural: salesforceCustomObject.pluralLabel!,
    },
    primaryFieldId: 'Name',
    fields: [
      toPropertyUnified(nameField, /* isNameField */ true),
      ...salesforceCustomObject.fields.map((field) => toPropertyUnified(field)),
    ],
  };
};

export const toPropertyUnified = (salesforceField: SalesforceCustomField, isNameField = false): PropertyUnified => {
  const type = fromCustomFieldTypeToPropertyType(salesforceField.type!);
  return {
    id: isNameField ? 'Name' : salesforceField.fullName!,
    label: salesforceField.label!,
    type,
    scale: salesforceField.scale ?? undefined,
    precision: salesforceField.precision ?? undefined,
    isRequired: (isNameField || salesforceField.required) ?? false,
    groupName: undefined,
    options: [],
    description: salesforceField.description ?? undefined,
    rawDetails: salesforceField,
  };
};

export const fromDescribeFieldToPropertyUnified = (describeResult: Field): PropertyUnified => {
  const type = fromDescribeTypeToPropertyType(describeResult.type);
  return {
    id: describeResult.name,
    customName: describeResult.name.endsWith('__c') ? describeResult.name : undefined,
    label: describeResult.label,
    type,
    scale: type === 'number' ? describeResult.scale : undefined,
    precision: type === 'number' ? describeResult.precision : undefined,
    isRequired: describeResult.nillable === false,
    groupName: undefined,
    options: [],
    description: describeResult.inlineHelpText ?? undefined,
    rawDetails: describeResult,
  };
};

export const fromDescribeTypeToPropertyType = (describeType: string): PropertyType => {
  switch (describeType) {
    case 'id':
    case 'reference':
    case 'url':
    case 'string':
    case 'email':
      return 'text';
    case 'textarea':
      return 'textarea';
    case 'picklist':
      return 'picklist';
    case 'boolean':
      return 'boolean';
    case 'double':
    case 'int':
      return 'number';
    case 'datetime':
      return 'datetime';
    case 'date':
      return 'date';
    case 'multipicklist':
      return 'multipicklist';
    default:
      return 'other';
  }
};

export const fromCustomFieldTypeToPropertyType = (salesforceType: string): PropertyType => {
  switch (salesforceType) {
    case 'DateTime':
      return 'datetime';
    case 'Date':
      return 'date';
    case 'Number':
      return 'number';
    case 'Text':
      return 'text';
    case 'Checkbox':
      return 'boolean';
    case 'Picklist':
      return 'picklist';
    case 'Multipicklist':
      return 'multipicklist';
    case 'TextArea':
      return 'textarea';
    case 'Url':
      return 'url';
    default:
      return 'other';
  }
};

// TODO: Figure out what to do with id and reference types
export const toSalesforceType = (property: PropertyUnified): ToolingAPICustomField['Metadata']['type'] => {
  switch (property.type) {
    case 'number':
      return 'Number';
    case 'text':
      return 'Text';
    case 'textarea':
      return 'TextArea';
    case 'boolean':
      return 'Checkbox';
    case 'picklist':
      return 'Picklist';
    case 'multipicklist':
      return 'MultiselectPicklist';
    case 'date':
      return 'Date';
    case 'datetime':
      return 'DateTime';
    case 'url':
      return 'Url';
    default:
      return 'Text';
  }
};

export const toSalesforceCustomFieldCreateParamsForToolingAPI = (
  objectName: string,
  property: PropertyUnified,
  prefixed = false
): Partial<ToolingAPICustomField> => {
  const salesforceType = toSalesforceType(property);
  const base = {
    // When calling the CustomObjects API, it does not need to be prefixed.
    // However, when calling the CustomFields API, it needs to be prefixed.
    FullName: prefixed ? `${objectName}.${property.id}` : property.id,
    Metadata: {
      label: property.label,
      required: property.isRequired ?? false,
      description: property.description,
      defaultValue: property.defaultValue?.toString() ?? null,
    },
  };

  switch (salesforceType) {
    case 'Text':
    case 'TextArea':
      return {
        ...base,
        Metadata: {
          ...base.Metadata,
          type: salesforceType,
          // TODO: Maybe textarea should be longer
          length: 255,
        },
      };
    case 'Number':
      return {
        ...base,
        Metadata: {
          ...base.Metadata,
          type: salesforceType,
          scale: property.scale!,
          precision: property.precision!,
        },
      };
    case 'Checkbox':
      return {
        ...base,
        Metadata: {
          ...base.Metadata,
          type: salesforceType,
          // Salesforce does not support the concept of required boolean fields
          required: false,
          // JS Force (incorrectly) expects string here
          // This is required for boolean fields
          defaultValue: property.defaultValue?.toString() ?? 'false',
        },
      };
    case 'Picklist':
    case 'MultiselectPicklist':
      if (!property.options || property.options.length === 0) {
        throw new BadRequestError(`Picklist property ${property.id} has no options`);
      }

      if (property.defaultValue && !property.options.find((option) => option.value === property.defaultValue)) {
        throw new BadRequestError(
          `Picklist property ${property.id} has a defaultValue that is not in the options: ${property.defaultValue}`
        );
      }

      return {
        ...base,
        Metadata: {
          ...base.Metadata,
          type: salesforceType,
          visibleLines: 4,
          valueSet: {
            restricted: false,
            valueSetDefinition: {
              sorted: false, // TODO: maybe support this?
              value: property.options.map((option) => ({
                valueName: option.value,
                label: option.label,
                description: option.description ?? '',
                default: option.value === property.defaultValue,
              })),
            },
          },
        },
      };
    default:
      return { ...base, Metadata: { ...base.Metadata, type: salesforceType } };
  }
};

export const toSalesforceCustomFieldCreateParams = (
  objectName: string,
  property: PropertyUnified,
  prefixed = false
): Partial<SalesforceCustomField> => {
  const base: Partial<SalesforceCustomField> = {
    // When calling the CustomObjects API, it does not need to be prefixed.
    // However, when calling the CustomFields API, it needs to be prefixed.
    fullName: prefixed ? `${objectName}.${property.id}` : property.id,
    label: property.label,
    type: toSalesforceType(property),
    required: property.isRequired,
    defaultValue: property.defaultValue?.toString() ?? null,
  };
  // if (property.defaultValue) {
  //   base = { ...base, defaultValue: property.defaultValue.toString() };
  // }
  if (property.type === 'text') {
    return {
      ...base,
      // TODO: Maybe textarea should be longer
      length: 255,
    };
  }
  if (property.type === 'number') {
    return {
      ...base,
      scale: property.scale,
      precision: property.precision,
    };
  }
  if (property.type === 'boolean') {
    return {
      ...base,
      // Salesforce does not support the concept of required boolean fields
      required: false,
      // JS Force (incorrectly) expects string here
      // This is required for boolean fields
      defaultValue: property.defaultValue?.toString() ?? 'false',
    };
  }
  // TODO: Support picklist options
  return base;
};

export const toSalesforceCustomObjectCreateParams = (
  objectName: string,
  labels: {
    singular: string;
    plural: string;
  },
  description: string | null,
  primaryField: PropertyUnified,
  nonPrimaryFieldsToUpdate: PropertyUnified[]
) => {
  return {
    deploymentStatus: 'Deployed',
    sharingModel: 'ReadWrite',
    fullName: objectName,
    description,
    label: labels.singular,
    pluralLabel: labels.plural,
    nameField: {
      label: primaryField?.label,
      type: 'Text',
    },
    fields: nonPrimaryFieldsToUpdate.map((field) => toSalesforceCustomFieldCreateParams(objectName, field)),
  };
};
