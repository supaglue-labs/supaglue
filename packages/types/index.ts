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
export * from './object_record';
export * from './passthrough';
export * from './property';
export * from './provider';
export * from './schema';
export * from './sg_user';
export * from './sync_config';
export * from './webhook';

export type NoCategoryProviderName = 'intercom';
export type ProviderName = CRMProviderName | EngagementProviderName | NoCategoryProviderName;
export type CategoryOfProviderName<T extends ProviderName> = T extends CRMProviderName
  ? CRMProviderCategory
  : T extends EngagementProviderName
  ? EngagementProviderCategory
  : 'nocategory';

export type CommonObjectForCategory<T extends ProviderCategory> = {
  crm: CRMCommonObjectType;
  engagement: EngagementCommonObjectType;
  nocategory: null;
}[T];

export type CommonObjectDef = {
  type: 'common';
  name: string;
};

export type StandardOrCustomObjectDef = {
  type: 'standard' | 'custom';
  name: string;
};
