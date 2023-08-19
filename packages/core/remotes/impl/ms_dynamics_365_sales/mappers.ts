import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  User,
} from '@supaglue/types/crm';
import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { toMappedProperties } from '../../utils/properties';

const industryCodeToName = {
  1: 'Accounting',
  2: 'Agriculture and Non-petrol Natural Resource Extraction',
  3: 'Broadcasting Printing and Publishing',
  4: 'Brokers',
  5: 'Building Supply Retail',
  6: 'Business Services',
  7: 'Consulting',
  8: 'Consumer Services',
  9: 'Design, Direction and Creative Management',
  10: 'Distributors, Dispatchers and Processors',
  11: "Doctor's Offices and Clinics",
  12: 'Durable Manufacturing',
  13: 'Eating and Drinking Places',
  14: 'Entertainment Retail',
  15: 'Equipment Rental and Leasing',
  16: 'Financial',
  17: 'Food and Tobacco Processing',
  18: 'Inbound Capital Intensive Processing',
  19: 'Inbound Repair and Services',
  20: 'Insurance',
  21: 'Legal Services',
  22: 'Non-Durable Merchandise Retail',
  23: 'Outbound Consumer Service',
  24: 'Petrochemical Extraction and Distribution',
  25: 'Service Retail',
  26: 'SIG Affiliations',
  27: 'Social Services',
  28: 'Special Outbound Trade Contractors',
  29: 'Specialty Realty',
  30: 'Transportation',
  31: 'Utility Creation and Distribution',
  32: 'Vehicle Retail',
  33: 'Wholesale',
};

export const industryNameToCode = Object.entries(industryCodeToName).reduce(
  (acc, [code, name]) => ({ ...acc, [name]: parseInt(code) }),
  {}
) as { [key: string]: number };

export type DynamicsAccount = {
  accountid: string;
  name: string | null;
  description: string | null;
  address1_line1: string | null;
  address1_line2: string | null;
  address1_city: string | null;
  address1_stateorprovince: string | null;
  address1_postalcode: string | null;
  address1_country: string | null;
  address1_addresstypecode: number | null;
  address2_line1: string | null;
  address2_line2: string | null;
  address2_city: string | null;
  address2_stateorprovince: string | null;
  address2_postalcode: string | null;
  address2_country: string | null;
  address2_addresstypecode: number | null;
  telephone1: string | null;
  telephone2: string | null;
  telephone3: string | null;
  websiteurl: string | null;
  _ownerid_value: string | null;
  industrycode: number | null;
  numberofemployees: number | null;
  createdon: string;
  overriddencreatedon: string | null;
  modifiedon: string;
};

export const fromDynamicsAccountToRemoteAccount = (
  dynamicsAccount: DynamicsAccount,
  fieldMappingConfig: FieldMappingConfig
): Account => {
  const addresses: Address[] = [];

  if (
    dynamicsAccount.address1_line1 ||
    dynamicsAccount.address1_line2 ||
    dynamicsAccount.address1_city ||
    dynamicsAccount.address1_stateorprovince ||
    dynamicsAccount.address1_postalcode ||
    dynamicsAccount.address1_country
  ) {
    const addressType =
      dynamicsAccount.address1_addresstypecode === 1
        ? 'billing'
        : dynamicsAccount.address1_addresstypecode === 2
        ? 'shipping'
        : dynamicsAccount.address1_addresstypecode === 3
        ? 'primary'
        : 'other';
    addresses.push({
      street1: dynamicsAccount.address1_line1,
      street2: dynamicsAccount.address1_line2,
      city: dynamicsAccount.address1_city,
      state: dynamicsAccount.address1_stateorprovince,
      postalCode: dynamicsAccount.address1_postalcode,
      country: dynamicsAccount.address1_country,
      addressType,
    });
  }

  if (
    dynamicsAccount.address2_line1 ||
    dynamicsAccount.address2_line2 ||
    dynamicsAccount.address2_city ||
    dynamicsAccount.address2_stateorprovince ||
    dynamicsAccount.address2_postalcode ||
    dynamicsAccount.address2_country
  ) {
    const addressType =
      dynamicsAccount.address1_addresstypecode === 1
        ? 'billing'
        : dynamicsAccount.address1_addresstypecode === 2
        ? 'shipping'
        : dynamicsAccount.address1_addresstypecode === 3
        ? 'primary'
        : 'other';
    addresses.push({
      street1: dynamicsAccount.address2_line1,
      street2: dynamicsAccount.address2_line2,
      city: dynamicsAccount.address2_city,
      state: dynamicsAccount.address2_stateorprovince,
      postalCode: dynamicsAccount.address2_postalcode,
      country: dynamicsAccount.address2_country,
      addressType,
    });
  }

  const phoneNumbers: PhoneNumber[] = [];

  if (dynamicsAccount.telephone1) {
    phoneNumbers.push({
      phoneNumber: dynamicsAccount.telephone1,
      phoneNumberType: 'primary', // Dynamics doesn't have a phone number type, but we assume that their "main phone" (telephone1) is primary
    });
  }

  if (dynamicsAccount.telephone2) {
    phoneNumbers.push({
      phoneNumber: dynamicsAccount.telephone2,
      phoneNumberType: 'other', // Dynamics doesn't have a phone number type
    });
  }

  if (dynamicsAccount.telephone3) {
    phoneNumbers.push({
      phoneNumber: dynamicsAccount.telephone3,
      phoneNumberType: 'other', // Dynamics doesn't have a phone number type
    });
  }

  const industryCodeString = dynamicsAccount.industrycode?.toString() as unknown as keyof typeof industryCodeToName;

  const industry =
    industryCodeString && industryCodeString in industryCodeToName ? industryCodeToName[industryCodeString] : null;

  return {
    id: dynamicsAccount.accountid,
    addresses,
    industry,
    numberOfEmployees: dynamicsAccount.numberofemployees,
    website: dynamicsAccount.websiteurl,
    createdAt: dynamicsAccount.overriddencreatedon
      ? new Date(dynamicsAccount.overriddencreatedon)
      : new Date(dynamicsAccount.createdon),
    updatedAt: new Date(dynamicsAccount.modifiedon),
    lastModifiedAt: new Date(dynamicsAccount.modifiedon),
    isDeleted: false,
    rawData: toMappedProperties(dynamicsAccount, fieldMappingConfig),
    name: dynamicsAccount.name,
    description: dynamicsAccount.description,
    ownerId: dynamicsAccount._ownerid_value,
    lastActivityAt: null, // TODO: Implement
    lifecycleStage: null, // account stages are deprecated in Dynamics
    phoneNumbers,
  };
};

export type DynamicsContact = {
  contactid: string;
  firstname: string | null;
  lastname: string | null;
  description: string | null;
  address1_line1: string | null;
  address1_line2: string | null;
  address1_city: string | null;
  address1_stateorprovince: string | null;
  address1_postalcode: string | null;
  address1_country: string | null;
  address1_addresstypecode: number | null;
  address2_line1: string | null;
  address2_line2: string | null;
  address2_city: string | null;
  address2_stateorprovince: string | null;
  address2_postalcode: string | null;
  address2_country: string | null;
  address2_addresstypecode: number | null;
  address3_line1: string | null;
  address3_line2: string | null;
  address3_city: string | null;
  address3_stateorprovince: string | null;
  address3_postalcode: string | null;
  address3_country: string | null;
  address3_addresstypecode: number | null;
  telephone1: string | null;
  telephone2: string | null;
  telephone3: string | null;
  emailaddress1: string | null;
  emailaddress2: string | null;
  emailaddress3: string | null;
  _ownerid_value: string | null;
  createdon: string;
  overriddencreatedon: string | null;
  modifiedon: string;
  _parentcustomerid_value: string | null;
};

export const fromDynamicsContactToRemoteContact = (
  dynamicsContact: DynamicsContact,
  fieldMappingConfig: FieldMappingConfig
): Contact => {
  const addresses: Address[] = [];

  if (
    dynamicsContact.address1_line1 ||
    dynamicsContact.address1_line2 ||
    dynamicsContact.address1_city ||
    dynamicsContact.address1_stateorprovince ||
    dynamicsContact.address1_postalcode ||
    dynamicsContact.address1_country
  ) {
    const addressType =
      dynamicsContact.address1_addresstypecode === 1
        ? 'billing'
        : dynamicsContact.address1_addresstypecode === 2
        ? 'shipping'
        : dynamicsContact.address1_addresstypecode === 3
        ? 'primary'
        : 'other';
    addresses.push({
      street1: dynamicsContact.address1_line1,
      street2: dynamicsContact.address1_line2,
      city: dynamicsContact.address1_city,
      state: dynamicsContact.address1_stateorprovince,
      postalCode: dynamicsContact.address1_postalcode,
      country: dynamicsContact.address1_country,
      addressType,
    });
  }

  if (
    dynamicsContact.address2_line1 ||
    dynamicsContact.address2_line2 ||
    dynamicsContact.address2_city ||
    dynamicsContact.address2_stateorprovince ||
    dynamicsContact.address2_postalcode ||
    dynamicsContact.address2_country
  ) {
    const addressType =
      dynamicsContact.address1_addresstypecode === 1
        ? 'billing'
        : dynamicsContact.address1_addresstypecode === 2
        ? 'shipping'
        : dynamicsContact.address1_addresstypecode === 3
        ? 'primary'
        : 'other';
    addresses.push({
      street1: dynamicsContact.address2_line1,
      street2: dynamicsContact.address2_line2,
      city: dynamicsContact.address2_city,
      state: dynamicsContact.address2_stateorprovince,
      postalCode: dynamicsContact.address2_postalcode,
      country: dynamicsContact.address2_country,
      addressType,
    });
  }

  const phoneNumbers: PhoneNumber[] = [];

  if (dynamicsContact.telephone1) {
    phoneNumbers.push({
      phoneNumber: dynamicsContact.telephone1,
      phoneNumberType: 'primary', // Dynamics doesn't have a phone number type, but we assume that their "business phone" (telephone1) is primary
    });
  }

  if (dynamicsContact.telephone2) {
    phoneNumbers.push({
      phoneNumber: dynamicsContact.telephone2,
      phoneNumberType: 'other', // Dynamics doesn't have a phone number type
    });
  }

  if (dynamicsContact.telephone3) {
    phoneNumbers.push({
      phoneNumber: dynamicsContact.telephone3,
      phoneNumberType: 'other', // Dynamics doesn't have a phone number type
    });
  }

  const emailAddresses: EmailAddress[] = [];

  if (dynamicsContact.emailaddress1) {
    emailAddresses.push({
      emailAddress: dynamicsContact.emailaddress1,
      emailAddressType: 'primary', // Dynamics doesn't have an email address type, but we assume the first is primary
    });
  }

  if (dynamicsContact.emailaddress2) {
    emailAddresses.push({
      emailAddress: dynamicsContact.emailaddress2,
      emailAddressType: 'other', // Dynamics doesn't have an email address type
    });
  }

  if (dynamicsContact.emailaddress3) {
    emailAddresses.push({
      emailAddress: dynamicsContact.emailaddress3,
      emailAddressType: 'other', // Dynamics doesn't have an email address type
    });
  }

  return {
    id: dynamicsContact.contactid,
    accountId: dynamicsContact._parentcustomerid_value,
    ownerId: dynamicsContact._ownerid_value,
    firstName: dynamicsContact.firstname,
    lastName: dynamicsContact.lastname,
    addresses,
    phoneNumbers,
    emailAddresses,
    lifecycleStage: null, // contact stages are deprecated in Dynamics
    lastActivityAt: null, // TODO: Implement
    createdAt: dynamicsContact.overriddencreatedon
      ? new Date(dynamicsContact.overriddencreatedon)
      : new Date(dynamicsContact.createdon),
    updatedAt: new Date(dynamicsContact.modifiedon),
    lastModifiedAt: new Date(dynamicsContact.modifiedon),
    isDeleted: false,
    rawData: toMappedProperties(dynamicsContact, fieldMappingConfig),
  };
};

export type DynamicsOpportunity = {
  opportunityid: string;
  name: string | null;
  description: string | null;
  statuscode: number | null;
  actualvalue: number | null;
  actualclosedate: string | null;
  stepname: string | null;
  overriddencreatedon: string | null;
  createdon: string;
  modifiedon: string;
  _ownerid_value: string | null;
  _parentaccountid_value: string | null;
  stageid_processstage: { stagename: string | null } | null;
  'stageid_processstage@odata.nextLink': string;
  opportunity_leadtoopportunitysalesprocess: { name: string | null } | null;
  'opportunity_leadtoopportunitysalesprocess@odata.nextLink': string;
};

export const fromDynamicsOpportunityToRemoteOpportunity = (
  dynamicsOpportunity: DynamicsOpportunity,
  fieldMappingConfig: FieldMappingConfig
): Opportunity => {
  const {
    opportunity_leadtoopportunitysalesprocess,
    ['opportunity_leadtoopportunitysalesprocess@odata.nextLink']: _,
    ['stageid_processstage@odata.nextLink']: __,
    stageid_processstage,
    ...rawData
  } = dynamicsOpportunity;

  let status: Opportunity['status'] = null;
  switch (dynamicsOpportunity.statuscode) {
    case 1: // In Progress
    case 2: // On Hold
      status = 'OPEN';
      break;
    case 3: // Won
      status = 'WON';
      break;
    case 4: // Canceled
    case 5: // Out-Sold
      status = 'LOST';
      break;
    default:
      status = null;
  }

  return {
    id: dynamicsOpportunity.opportunityid,
    name: dynamicsOpportunity.name,
    description: dynamicsOpportunity.description,
    ownerId: dynamicsOpportunity._ownerid_value,
    lastActivityAt: null, // TODO: Implement
    status,
    pipeline: opportunity_leadtoopportunitysalesprocess?.name ?? null,
    accountId: dynamicsOpportunity._parentaccountid_value,
    amount: dynamicsOpportunity.actualvalue !== null ? Math.trunc(dynamicsOpportunity.actualvalue) : null, // 8/3/23: For backward compatibility. TODO: remove after customer migrations.
    closeDate: dynamicsOpportunity.actualclosedate ? new Date(dynamicsOpportunity.actualclosedate) : null,
    stage: stageid_processstage?.stagename ?? dynamicsOpportunity.stepname,
    createdAt: dynamicsOpportunity.overriddencreatedon
      ? new Date(dynamicsOpportunity.overriddencreatedon)
      : new Date(dynamicsOpportunity.createdon),
    updatedAt: new Date(dynamicsOpportunity.modifiedon),
    isDeleted: false,
    lastModifiedAt: new Date(dynamicsOpportunity.modifiedon),
    rawData: toMappedProperties(rawData, fieldMappingConfig),
  };
};

export type DynamicsLead = {
  leadid: string;
  firstname: string | null;
  lastname: string | null;
  jobtitle: string | null;
  companyname: string | null;
  description: string | null;
  address1_line1: string | null;
  address1_line2: string | null;
  address1_city: string | null;
  address1_stateorprovince: string | null;
  address1_postalcode: string | null;
  address1_country: string | null;
  address1_addresstypecode: number | null;
  address2_line1: string | null;
  address2_line2: string | null;
  address2_city: string | null;
  address2_stateorprovince: string | null;
  address2_postalcode: string | null;
  address2_country: string | null;
  address2_addresstypecode: number | null;
  emailaddress1: string | null;
  emailaddress2: string | null;
  emailaddress3: string | null;
  telephone1: string | null;
  telephone2: string | null;
  telephone3: string | null;
  websiteurl: string | null;
  _ownerid_value: string | null;
  industrycode: number | null;
  numberofemployees: number | null;
  createdon: string;
  overriddencreatedon: string | null;
  modifiedon: string;
  leadsourcecode: number | null;
  _accountid_value: string | null;
  _contactid_value: string | null;
};

export const fromDynamicsLeadToRemoteLead = (
  dynamicsLead: DynamicsLead,
  fieldMappingConfig: FieldMappingConfig
): Lead => {
  const leadSource = null;

  const addresses: Address[] = [];
  if (
    dynamicsLead.address1_line1 ||
    dynamicsLead.address1_line2 ||
    dynamicsLead.address1_city ||
    dynamicsLead.address1_stateorprovince ||
    dynamicsLead.address1_postalcode ||
    dynamicsLead.address1_country
  ) {
    const addressType =
      dynamicsLead.address1_addresstypecode === 1
        ? 'billing'
        : dynamicsLead.address1_addresstypecode === 2
        ? 'shipping'
        : dynamicsLead.address1_addresstypecode === 3
        ? 'primary'
        : 'other';
    addresses.push({
      street1: dynamicsLead.address1_line1,
      street2: dynamicsLead.address1_line2,
      city: dynamicsLead.address1_city,
      state: dynamicsLead.address1_stateorprovince,
      postalCode: dynamicsLead.address1_postalcode,
      country: dynamicsLead.address1_country,
      addressType,
    });
  }

  if (
    dynamicsLead.address2_line1 ||
    dynamicsLead.address2_line2 ||
    dynamicsLead.address2_city ||
    dynamicsLead.address2_stateorprovince ||
    dynamicsLead.address2_postalcode ||
    dynamicsLead.address2_country
  ) {
    const addressType =
      dynamicsLead.address2_addresstypecode === 1
        ? 'billing'
        : dynamicsLead.address2_addresstypecode === 2
        ? 'shipping'
        : dynamicsLead.address2_addresstypecode === 3
        ? 'primary'
        : 'other';
    addresses.push({
      street1: dynamicsLead.address2_line1,
      street2: dynamicsLead.address2_line2,
      city: dynamicsLead.address2_city,
      state: dynamicsLead.address2_stateorprovince,
      postalCode: dynamicsLead.address2_postalcode,
      country: dynamicsLead.address2_country,
      addressType,
    });
  }

  const phoneNumbers: PhoneNumber[] = [];

  if (dynamicsLead.telephone1) {
    phoneNumbers.push({
      phoneNumber: dynamicsLead.telephone1,
      phoneNumberType: 'primary', // Dynamics doesn't have a phone number type, but we assume that their "business phone" (telephone1) is primary
    });
  }

  if (dynamicsLead.telephone2) {
    phoneNumbers.push({
      phoneNumber: dynamicsLead.telephone2,
      phoneNumberType: 'other', // Dynamics doesn't have a phone number type
    });
  }

  if (dynamicsLead.telephone3) {
    phoneNumbers.push({
      phoneNumber: dynamicsLead.telephone3,
      phoneNumberType: 'other', // Dynamics doesn't have a phone number type
    });
  }

  const emailAddresses: EmailAddress[] = [];

  if (dynamicsLead.emailaddress1) {
    emailAddresses.push({
      emailAddress: dynamicsLead.emailaddress1,
      emailAddressType: 'primary', // Dynamics doesn't have an email address type, but we assume the first is primary
    });
  }

  if (dynamicsLead.emailaddress2) {
    emailAddresses.push({
      emailAddress: dynamicsLead.emailaddress2,
      emailAddressType: 'other', // Dynamics doesn't have an email address type
    });
  }

  if (dynamicsLead.emailaddress3) {
    emailAddresses.push({
      emailAddress: dynamicsLead.emailaddress3,
      emailAddressType: 'other', // Dynamics doesn't have an email address type
    });
  }

  return {
    id: dynamicsLead.leadid,
    firstName: dynamicsLead.firstname,
    lastName: dynamicsLead.lastname,
    title: dynamicsLead.jobtitle,
    ownerId: dynamicsLead._ownerid_value,
    company: dynamicsLead.companyname,
    convertedDate: null, // TODO: Implement
    leadSource,
    convertedAccountId: dynamicsLead._accountid_value, // TODO: check to see if this is correct
    convertedContactId: dynamicsLead._contactid_value, // TODO: check to see if this is correct
    addresses,
    emailAddresses,
    phoneNumbers,
    createdAt: dynamicsLead.overriddencreatedon
      ? new Date(dynamicsLead.overriddencreatedon)
      : new Date(dynamicsLead.createdon),
    updatedAt: new Date(dynamicsLead.modifiedon),
    isDeleted: false,
    lastModifiedAt: new Date(dynamicsLead.modifiedon),
    rawData: toMappedProperties(dynamicsLead, fieldMappingConfig),
  };
};

export type DynamicsUser = {
  systemuserid: string;
  fullname: string | null;
  internalemailaddress: string | null;
  deletedstate: number | null;
  createdon: string;
  overriddencreatedon: string | null;
  modifiedon: string;
  isdisabled: boolean;
};

export const fromDynamicsUserToRemoteUser = (
  dynamicsUser: DynamicsUser,
  fieldMappingConfig: FieldMappingConfig
): User => {
  return {
    id: dynamicsUser.systemuserid,
    name: dynamicsUser.fullname,
    email: dynamicsUser.internalemailaddress,
    isDeleted: dynamicsUser.deletedstate === 1,
    isActive: !dynamicsUser.isdisabled,
    createdAt: dynamicsUser.overriddencreatedon
      ? new Date(dynamicsUser.overriddencreatedon)
      : new Date(dynamicsUser.createdon),
    updatedAt: new Date(dynamicsUser.modifiedon),
    lastModifiedAt: new Date(dynamicsUser.modifiedon),
    rawData: toMappedProperties(dynamicsUser, fieldMappingConfig),
  };
};

export const toDynamicsContactCreateParams = (contact: ContactCreateParams): Record<string, unknown> => {
  return {
    firstname: contact.firstName,
    lastname: contact.lastName,
    'parentcustomerid@odata.bind': contact.accountId ? `/accounts(${contact.accountId})` : undefined,
    'ownerid@odata.bind': contact.ownerId ? `/systemusers(${contact.ownerId})` : undefined,
    ...toDynamicsAddresses(contact.addresses, 3),
    ...toDynamicsEmailAddresses(contact.emailAddresses),
    ...toDynamicsPhoneNumbers(contact.phoneNumbers),
    ...contact.customFields,
  };
};

export const toDynamicsContactUpdateParams = (contact: ContactUpdateParams): Record<string, unknown> => {
  return toDynamicsContactCreateParams(contact);
};

export const toDynamicsOpportunityCreateParams = (opportunity: OpportunityCreateParams): Record<string, unknown> => {
  return {
    name: opportunity.name,
    description: opportunity.description,
    actualvalue: opportunity.amount,
    stepname: opportunity.stage,
    actualclosedate: opportunity.closeDate?.toISOString().split('T')[0],
    'parentaccountid@odata.bind': opportunity.accountId ? `/accounts(${opportunity.accountId})` : undefined,
    'ownerid@odata.bind': opportunity.ownerId ? `/systemusers(${opportunity.ownerId})` : undefined,
    statuscode:
      opportunity.status == 'OPEN' ? 1 : opportunity.status == 'WON' ? 3 : opportunity.status == 'LOST' ? 5 : undefined,
    ...opportunity.customFields,
  };
};

export const toDynamicsOpportunityUpdateParams = (opportunity: OpportunityUpdateParams): Record<string, unknown> => {
  return toDynamicsOpportunityCreateParams(opportunity);
};

const leadSourceNameToCode: Record<string, number> = {
  Advertisement: 1,
  'Employee Referral': 2,
  'External Referral': 3,
  Partner: 4,
  'Public Relations': 5,
  Seminar: 6,
  'Trade Show': 7,
  Web: 8,
  'Word of Mouth': 9,
};

export const toDynamicsLeadCreateParams = (lead: LeadCreateParams): Record<string, unknown> => {
  return {
    firstname: lead.firstName,
    lastname: lead.lastName,
    jobtitle: lead.title,
    companyname: lead.company,
    ...toDynamicsAddresses(lead.addresses, 2),
    ...toDynamicsEmailAddresses(lead.emailAddresses),
    ...toDynamicsPhoneNumbers(lead.phoneNumbers),
    'ownerid@odata.bind': lead.ownerId ? `/systemusers(${lead.ownerId})` : undefined,
    leadsourcecode:
      lead.leadSource && lead.leadSource in leadSourceNameToCode
        ? leadSourceNameToCode[lead.leadSource]
        : 10 /* Other */,
    ...lead.customFields,
  };
};

export const toDynamicsLeadUpdateParams = (lead: LeadUpdateParams): Record<string, unknown> => {
  return toDynamicsLeadCreateParams(lead);
};

export const toDynamicsAccountCreateParams = (account: AccountCreateParams): Record<string, unknown> => {
  return {
    name: account.name,
    description: account.description,
    industrycode:
      account.industry && account.industry in industryNameToCode ? industryNameToCode[account.industry] : undefined,
    websiteurl: account.website,
    'ownerid@odata.bind': account.ownerId ? `/systemusers(${account.ownerId})` : undefined,
    numberofemployees: account.numberOfEmployees,
    ...account.customFields,
  };
};

export const toDynamicsAccountUpdateParams = (account: AccountUpdateParams): Record<string, unknown> => {
  return toDynamicsAccountCreateParams(account);
};

export const toDynamicsAddresses = (addresses: Address[] | undefined, count: number): Record<string, string | null> => {
  if (!addresses) {
    return {};
  }
  // make sure primary address is first
  addresses.sort((a, b) => {
    if (a.addressType === 'primary') {
      return -1;
    }
    if (b.addressType === 'primary') {
      return 1;
    }
    return 0;
  });

  if (count < 2 || count > 3) {
    throw new Error('Dynamics only supports 2 or 3 addresses, depending on type');
  }

  return addresses.slice(0, count).reduce((acc, address, index) => {
    const addressType =
      address.addressType === 'billing'
        ? '1'
        : address.addressType === 'shipping'
        ? '2'
        : address.addressType === 'primary'
        ? '3'
        : null;
    return {
      ...acc,
      [`address${index + 1}_line1`]: address.street1,
      [`address${index + 1}_line2`]: address.street2,
      [`address${index + 1}_city`]: address.city,
      [`address${index + 1}_stateorprovince`]: address.state,
      [`address${index + 1}_postalcode`]: address.postalCode,
      [`address${index + 1}_country`]: address.country,
      [`address${index + 1}_addresstypecode`]: addressType,
    };
  }, {});
};

export const toDynamicsEmailAddresses = (emailAddresses: EmailAddress[] | undefined): Record<string, string | null> => {
  if (!emailAddresses) {
    return {};
  }
  // make sure emailAddressType === 'primary' is first
  emailAddresses.sort((a, b) => {
    if (a.emailAddressType === 'primary') {
      return -1;
    }
    if (b.emailAddressType === 'primary') {
      return 1;
    }
    return 0;
  });
  // only the first 3 email addresses are supported
  return emailAddresses.slice(0, 3).reduce((acc, emailAddress, index) => {
    return {
      ...acc,
      [`emailaddress${index + 1}`]: emailAddress.emailAddress,
    };
  }, {});
};

export const toDynamicsPhoneNumbers = (phoneNumbers: PhoneNumber[] | undefined): Record<string, string | null> => {
  if (!phoneNumbers) {
    return {};
  }

  // make sure phoneNumberType === 'primary' is first
  phoneNumbers.sort((a, b) => {
    if (a.phoneNumberType === 'primary') {
      return -1;
    }
    if (b.phoneNumberType === 'primary') {
      return 1;
    }
    return 0;
  });
  // only the first 3 phone numbers are supported
  return phoneNumbers.slice(0, 3).reduce((acc, phoneNumber, index) => {
    return {
      ...acc,
      [`telephone${index + 1}`]: phoneNumber.phoneNumber,
    };
  }, {});
};
