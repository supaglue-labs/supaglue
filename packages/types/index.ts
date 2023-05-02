import { CRMProviderCategory, CRMProviderName } from './crm';
import { EngagementProviderCategory, EngagementProviderName } from './engagement';

export * from './application';
export * from './common';
export * from './connection';
export * from './crm';
export * from './customer';
export * from './integration';
export * from './passthrough';
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
