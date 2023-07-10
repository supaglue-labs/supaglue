import type { ProviderCategory } from './common';
import type { CRMCommonObjectType, CRMProviderCategory, CRMProviderName } from './crm';
import type { EngagementCommonObjectType, EngagementProviderCategory, EngagementProviderName } from './engagement';

export * from './application';
export * from './common';
export * from './connection';
export * as crm from './crm';
export * from './customer';
export * from './destination';
export * as engagement from './engagement';
export * from './field_mapping_info';
export * from './oauth';
export * from './passthrough';
export * from './provider';
export * from './raw_record';
export * from './schema';
export * from './sg_user';
export * from './sync_config';
export * from './webhook';

export type ProviderName = CRMProviderName | EngagementProviderName;
export type CategoryOfProviderName<T extends ProviderName> = T extends CRMProviderName
  ? CRMProviderCategory
  : EngagementProviderCategory;

export type CommonObjectForCategory<T extends ProviderCategory> = T extends 'crm'
  ? CRMCommonObjectType
  : EngagementCommonObjectType;

export type CommonObjectDef = {
  type: 'common';
  name: string;
};

export type StandardOrCustomObjectDef = {
  type: 'standard' | 'custom';
  name: string;
};
