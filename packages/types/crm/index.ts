import type {
  Account,
  Contact,
  Lead,
  Opportunity,
  RemoteAccountTypes,
  RemoteContactTypes,
  RemoteLeadTypes,
  RemoteOpportunityTypes,
  RemoteUserTypes,
} from '.';

export const SUPPORTED_CRM_PROVIDERS = [
  'salesforce',
  'hubspot',
  'pipedrive',
  'zendesk_sell',
  'ms_dynamics_365_sales',
  'zoho_crm',
  'capsule',
] as const;

export type CRMProviderName = (typeof SUPPORTED_CRM_PROVIDERS)[number];
export type CRMProviderCategory = 'crm';

export const CRM_COMMON_OBJECT_TYPES = ['account', 'contact', 'lead', 'opportunity', 'user'] as const;
export type CRMCommonObjectType = (typeof CRM_COMMON_OBJECT_TYPES)[number];

export type ListCRMCommonObject = Exclude<CRMCommonObjectType, 'user'>;
export type ListCRMCommonObjectType = Contact | Account | Lead | Opportunity;

export type ListCRMCommonObjectTypeMap<T extends ListCRMCommonObject> = {
  contact: Contact;
  account: Account;
  lead: Lead;
  opportunity: Opportunity;
}[T];

export type CRMCommonObjectTypeMap<T extends CRMCommonObjectType> = {
  account: RemoteAccountTypes;
  contact: RemoteContactTypes;
  lead: RemoteLeadTypes;
  opportunity: RemoteOpportunityTypes;
  user: RemoteUserTypes;
}[T];

export type CustomFields = Record<string, any>;

export type ListMetadata = {
  id: string;
  objectType: ListCRMCommonObject;
  name: string;
  label: string;
  rawData: Record<string, unknown>;
};

export * from './account';
export * from './base';
export * from './contact';
export * from './lead';
export * from './opportunity';
export * from './user';
