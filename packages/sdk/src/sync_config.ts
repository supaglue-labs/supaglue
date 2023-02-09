import { CustomerDestination } from './customer/destinations';
import { CustomerSource } from './customer/sources';
import { FieldMapping } from './field_mapping';
import { InternalDestination } from './internal/destinations';
import { InternalSource } from './internal/sources';

export type BaseSyncConfig = {
  name: string; // unique (e.g. ContactSync, LeadSync, AccountSync)

  // some valid cron string
  // TODO: we'll want to allow triggered sync runs down the line
  cronExpression: string;

  // TODO: support incremental
  strategy: 'full_refresh';

  defaultFieldMapping?: FieldMapping[];
};

type InboundSyncConfig = BaseSyncConfig & {
  type: 'inbound';
  source: CustomerSource;
  destination: InternalDestination;
};

type OutboundSyncConfig = BaseSyncConfig & {
  type: 'outbound';
  source: InternalSource;
  destination: CustomerDestination;
};

export type SyncConfig = InboundSyncConfig | OutboundSyncConfig;

export function inbound(params: Omit<InboundSyncConfig, 'type'>): InboundSyncConfig {
  return {
    type: 'inbound',
    ...params,
  };
}

export function outbound(params: Omit<OutboundSyncConfig, 'type'>): OutboundSyncConfig {
  return {
    type: 'outbound',
    ...params,
  };
}
