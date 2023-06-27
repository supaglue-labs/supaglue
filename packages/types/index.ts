import { ProviderCategory } from './common';
import { CRMCommonModelType, CRMProviderCategory, CRMProviderName } from './crm';
import { EngagementCommonModelType, EngagementProviderCategory, EngagementProviderName } from './engagement';

export * from './application';
export * from './common';
export * from './connection';
export * as crm from './crm';
export * from './customer';
export * from './destination';
export * as engagement from './engagement';
export * from './oauth';
export * from './passthrough';
export * from './provider';
export * from './raw_record';
export * from './schema';
export * from './sg_user';
export * from './sync';
export * from './sync_config';
export * from './sync_history';
export * from './sync_info';
export * from './webhook';

export type ProviderName = CRMProviderName | EngagementProviderName;
export type CategoryOfProviderName<T extends ProviderName> = T extends CRMProviderName
  ? CRMProviderCategory
  : EngagementProviderCategory;

export type CommonModelForCategory<T extends ProviderCategory> = T extends 'crm'
  ? CRMCommonModelType
  : EngagementCommonModelType;
