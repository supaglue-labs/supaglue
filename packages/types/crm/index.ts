import { AccountTypes, ContactTypes, EventTypes, LeadTypes, OpportunityTypes, UserTypes } from '..';

export const SUPPORTED_CRM_CONNECTIONS = [
  'salesforce',
  'hubspot',
  'pipedrive',
  'zendesk_sell',
  'ms_dynamics_365_sales',
  'zoho_crm',
  'capsule',
] as const;

export type CRMProviderName = (typeof SUPPORTED_CRM_CONNECTIONS)[number];

export const CRM_COMMON_MODEL_TYPES = ['account', 'contact', 'lead', 'opportunity', 'user', 'event'] as const;
export type CRMCommonModelType = (typeof CRM_COMMON_MODEL_TYPES)[number];

export type CRMCommonModelTypeMap<T extends CRMCommonModelType> = T extends 'account'
  ? AccountTypes
  : T extends 'contact'
  ? ContactTypes
  : T extends 'lead'
  ? LeadTypes
  : T extends 'opportunity'
  ? OpportunityTypes
  : T extends 'user'
  ? UserTypes
  : T extends 'event'
  ? EventTypes
  : never;

// export type CRMCommonModelTypeMap<T extends CRMCommonModelType> = {
//   account: AccountTypes;
//   contact: ContactTypes;
//   lead: LeadTypes;
//   opportunity: OpportunityTypes;
//   user: UserTypes;
//   event: EventTypes;
// }[T];

export type CustomFields = Record<string, any>;

export * from './account';
export * from './base';
export * from './contact';
export * from './event';
export * from './lead';
export * from './opportunity';
export * from './user';
