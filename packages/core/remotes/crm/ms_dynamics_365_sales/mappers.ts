import { AccountV2, ContactV2, LeadV2, OpportunityV2, UserV2 } from '@supaglue/types/crm';
import { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';

type DynamicsAccount = {
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

export const fromDynamicsAccountToRemoteAccount = (dynamicsAccount: DynamicsAccount): AccountV2 => {
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

  let industry: string | null = null;

  switch (dynamicsAccount.industrycode) {
    case 1:
      industry = 'Accounting';
      break;
    case 2:
      industry = 'Agriculture and Non-petrol Natural Resource Extraction';
      break;
    case 3:
      industry = 'Broadcasting Printing and Publishing';
      break;
    case 4:
      industry = 'Brokers';
      break;
    case 5:
      industry = 'Building Supply Retail';
      break;
    case 6:
      industry = 'Business Services';
      break;
    case 7:
      industry = 'Consulting';
      break;
    case 8:
      industry = 'Consumer Services';
      break;
    case 9:
      industry = 'Design, Direction and Creative Management';
      break;
    case 10:
      industry = 'Distributors, Dispatchers and Processors';
      break;
    case 11:
      industry = "Doctor's Offices and Clinics";
      break;
    case 12:
      industry = 'Durable Manufacturing';
      break;
    case 13:
      industry = 'Eating and Drinking Places';
      break;
    case 14:
      industry = 'Entertainment Retail';
      break;
    case 15:
      industry = 'Equipment Rental and Leasing';
      break;
    case 16:
      industry = 'Financial';
      break;
    case 17:
      industry = 'Food and Tobacco Processing';
      break;
    case 18:
      industry = 'Inbound Capital Intensive Processing';
      break;
    case 19:
      industry = 'Inbound Repair and Services';
      break;
    case 20:
      industry = 'Insurance';
      break;
    case 21:
      industry = 'Legal Services';
      break;
    case 22:
      industry = 'Non-Durable Merchandise Retail';
      break;
    case 23:
      industry = 'Outbound Consumer Service';
      break;
    case 24:
      industry = 'Petrochemical Extraction and Distribution';
      break;
    case 25:
      industry = 'Service Retail';
      break;
    case 26:
      industry = 'SIG Affiliations';
      break;
    case 27:
      industry = 'Social Services';
      break;
    case 28:
      industry = 'Special Outbound Trade Contractors';
      break;
    case 29:
      industry = 'Specialty Realty';
      break;
    case 30:
      industry = 'Transportation';
      break;
    case 31:
      industry = 'Utility Creation and Distribution';
      break;
    case 32:
      industry = 'Vehicle Retail';
      break;
    case 33:
      industry = 'Wholesale';
      break;
    default:
      industry = null;
  }

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
    rawData: dynamicsAccount,
    name: dynamicsAccount.name,
    description: dynamicsAccount.description,
    ownerId: dynamicsAccount._ownerid_value,
    lastActivityAt: null, // TODO: Implement
    lifecycleStage: null, // account stages are deprecated in Dynamics
    phoneNumbers,
  };
};

type DynamicsContact = {
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

export const fromDynamicsContactToRemoteContact = (dynamicsContact: DynamicsContact): ContactV2 => {
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
    rawData: dynamicsContact,
  };
};

type DynamicsOpportunity = {
  opportunityid: string;
  name: string | null;
  description: string | null;
  statuscode: number | null;
  totalamount: number | null;
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

export const fromDynamicsOpportunityToRemoteOpportunity = (dynamicsOpportunity: DynamicsOpportunity): OpportunityV2 => {
  const {
    opportunity_leadtoopportunitysalesprocess,
    ['opportunity_leadtoopportunitysalesprocess@odata.nextLink']: _,
    ['stageid_processstage@odata.nextLink']: __,
    stageid_processstage,
    ...rawData
  } = dynamicsOpportunity;

  let status: OpportunityV2['status'] = null;
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
    amount: dynamicsOpportunity.totalamount,
    closeDate: dynamicsOpportunity.actualclosedate ? new Date(dynamicsOpportunity.actualclosedate) : null,
    stage: stageid_processstage?.stagename ?? dynamicsOpportunity.stepname,
    createdAt: dynamicsOpportunity.overriddencreatedon
      ? new Date(dynamicsOpportunity.overriddencreatedon)
      : new Date(dynamicsOpportunity.createdon),
    updatedAt: new Date(dynamicsOpportunity.modifiedon),
    isDeleted: false,
    lastModifiedAt: new Date(dynamicsOpportunity.modifiedon),
    rawData,
  };
};

type DynamicsLead = {
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

export const fromDynamicsLeadToRemoteLead = (dynamicsLead: DynamicsLead): LeadV2 => {
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
      dynamicsLead.address1_addresstypecode === 1
        ? 'billing'
        : dynamicsLead.address1_addresstypecode === 2
        ? 'shipping'
        : dynamicsLead.address1_addresstypecode === 3
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
    rawData: dynamicsLead,
  };
};

type DynamicsUser = {
  systemuserid: string;
  fullname: string | null;
  internalemailaddress: string | null;
  deletedstate: number | null;
  createdon: string;
  overriddencreatedon: string | null;
  modifiedon: string;
  isdisabled: boolean;
};

export const fromDynamicsUserToRemoteUser = (dynamicsUser: DynamicsUser): UserV2 => {
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
    rawData: dynamicsUser,
  };
};
