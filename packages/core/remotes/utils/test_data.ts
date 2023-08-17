import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import type { PipelineStageMapping } from '../impl/hubspot';

export const DATE_STRING = '2023-08-17T00:00:00.000Z';
export const DATE = new Date(DATE_STRING);

export const CRM_PRIMARY_ADDRESS: Address = {
  street1: 'Test street 1',
  street2: null,
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94043',
  country: 'USA',
  addressType: 'primary',
};

export const CRM_MAILING_ADDRESS: Address = {
  street1: 'Mailing street 1',
  street2: null,
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94043',
  country: 'USA',
  addressType: 'mailing',
};

export const CRM_SHIPPING_ADDRESS: Address = {
  street1: 'Shipping street 1',
  street2: null,
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94043',
  country: 'USA',
  addressType: 'shipping',
};

export const CRM_BILLING_ADDRESS: Address = {
  street1: 'Billing street 1',
  street2: null,
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94043',
  country: 'USA',
  addressType: 'billing',
};

export const CRM_OTHER_ADDRESS: Address = {
  street1: 'Other street 1',
  street2: null,
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94043',
  country: 'USA',
  addressType: 'other',
};

export const CRM_PRIMARY_PHONE: PhoneNumber = {
  phoneNumber: '5102932345',
  phoneNumberType: 'primary',
};
export const CRM_MOBILE_PHONE: PhoneNumber = {
  phoneNumber: '1234567890',
  phoneNumberType: 'mobile',
};
export const CRM_FAX: PhoneNumber = {
  phoneNumber: '6934982349',
  phoneNumberType: 'fax',
};

export const CRM_PRIMARY_EMAIL: EmailAddress = {
  emailAddress: 'primary@address.com',
  emailAddressType: 'primary',
};

export const CRM_WORK_EMAIL: EmailAddress = {
  emailAddress: 'work@address.com',
  emailAddressType: 'work',
};

export const HUBSPOT_PIPELINE_STAGE_MAPPING: PipelineStageMapping = {
  default: {
    label: 'Sales Pipeline',
    stageIdsToLabels: {
      appointmentscheduled: 'Appointment Scheduled',
      qualifiedtobuy: 'Qualified To Buy',
      presentationscheduled: 'Presentation Scheduled',
      decisionmakerboughtin: 'Decision Maker Bought-In',
      contractsent: 'Contract Sent',
      closedwon: 'Closed Won',
      closedlost: 'Closed Lost',
    },
  },
  custom: {
    label: 'Custom Pipeline',
    stageIdsToLabels: {
      stage1: 'Stage 1',
      stage2: 'Stage 2',
      stage3: 'Stage 3',
    },
  },
};

export const PIPEDRIVE_PIPELINE_STAGE_MAPPING: PipelineStageMapping = {
  '0': {
    label: 'Sales Pipeline',
    stageIdsToLabels: {
      0: 'Appointment Scheduled',
      1: 'Qualified To Buy',
      2: 'Presentation Scheduled',
      3: 'Decision Maker Bought-In',
      4: 'Contract Sent',
      5: 'Closed Won',
      6: 'Closed Lost',
    },
  },
  '1': {
    label: 'Custom Pipeline',
    stageIdsToLabels: {
      0: 'Stage 1',
      1: 'Stage 2',
      2: 'Stage 3',
    },
  },
};
