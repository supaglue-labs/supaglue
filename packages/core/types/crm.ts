export const SUPPORTED_CRM_CONNECTIONS = ['salesforce', 'hubspot', 'pipedrive'] as const;

export type CRMProviderName = 'salesforce' | 'hubspot' | 'pipedrive';

export const CRM_COMMON_MODELS = ['account', 'contact', 'lead', 'opportunity'] as const;
export type CRMCommonModel = (typeof CRM_COMMON_MODELS)[number];
