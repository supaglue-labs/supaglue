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

export const CRM_COMMON_MODELS = ['account', 'contact', 'lead', 'opportunity'] as const;
export type CRMCommonModel = (typeof CRM_COMMON_MODELS)[number];

export * from './account';
export * from './contact';
export * from './lead';
export * from './opportunity';
export * from './user';
