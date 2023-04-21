import { CRMProviderName } from './crm';
import { EngagementProviderName } from './engagement';

export * from './application';
export * from './common';
export * from './connection';
export * as crm from './crm';
export * from './customer';
export * from './destination';
// TODO: crm already has duplicate 'Contact' common model type
// Should we do this for the other re-exports?
export * as engagement from './engagement';
export * from './integration';
export * from './passthrough';
export * from './sg_user';
export * from './sync';
export * from './sync_config';
export * from './sync_history';
export * from './sync_info';
export * from './webhook';

export type ProviderName = CRMProviderName | EngagementProviderName;
