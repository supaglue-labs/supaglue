import { RemoteAccountTypes, RemoteContactTypes, RemoteLeadTypes, RemoteOpportunityTypes, RemoteUserTypes } from '.';

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
export type CRMProviderCategory = 'crm';

export const CRM_COMMON_MODELS = ['account', 'contact', 'lead', 'opportunity', 'user'] as const;
export type CRMCommonModelType = (typeof CRM_COMMON_MODELS)[number];

export type CRMCommonModelTypeMap<T extends CRMCommonModelType> = {
  account: RemoteAccountTypes;
  contact: RemoteContactTypes;
  lead: RemoteLeadTypes;
  opportunity: RemoteOpportunityTypes;
  user: RemoteUserTypes;
}[T];

export type CustomFields = Record<string, any>;

export * from './account';
export * from './base';
export * from './contact';
export * from './lead';
export * from './opportunity';
export * from './user';
