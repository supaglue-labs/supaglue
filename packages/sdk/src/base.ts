import { FieldMapping } from './defaultFieldMapping';

export type BaseSyncConfig = {
  name: string; // unique (e.g. ContactSync, LeadSync, AccountSync)

  // TODO: We will want to allow customer to choose for outbound down the road
  salesforceObject: 'Contact' | 'Lead' | 'Account' | 'Opportunity';

  // some valid cron string
  // TODO: we'll want to allow triggered sync runs down the line
  cronExpression: string;

  // TODO: support incremental
  strategy: 'full_refresh';

  defaultFieldMapping?: FieldMapping[];
};
