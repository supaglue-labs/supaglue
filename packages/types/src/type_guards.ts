import {
  InboundSyncConfig,
  InternalDestination,
  OutboundSyncConfig,
  PostgresDestination,
  RealtimeInboundSyncConfig,
  SyncConfig,
} from '.';

export const isRealtimeInboundSyncConfig = (syncConfig: SyncConfig): syncConfig is RealtimeInboundSyncConfig => {
  return syncConfig.name === 'realtime_inbound';
};

export const isInboundSyncConfig = (syncConfig: SyncConfig): syncConfig is InboundSyncConfig => {
  return syncConfig.name === 'inbound';
};

export const isOutboundSyncConfig = (syncConfig: SyncConfig): syncConfig is OutboundSyncConfig => {
  return syncConfig.name === 'outbound';
};

export const isPostgresDestination = (destination: InternalDestination): destination is PostgresDestination => {
  return destination.type === 'postgres';
};
