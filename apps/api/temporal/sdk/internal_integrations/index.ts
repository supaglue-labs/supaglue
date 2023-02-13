import { Sync, SyncConfig } from '@supaglue/types';
import { DestinationPostgresInternalIntegration, SourcePostgresInternalIntegration } from './postgres';
import { DestinationWebhookInternalIntegration } from './webhook';

export type InternalIntegrations = {
  sources: {
    postgres: SourcePostgresInternalIntegration;
  };
  destinations: {
    postgres: DestinationPostgresInternalIntegration;
    webhook: DestinationWebhookInternalIntegration;
  };
};

export const createInternalIntegrations = (sync: Sync, syncConfig: SyncConfig, syncRunId: string) => {
  return {
    sources: {
      postgres: new SourcePostgresInternalIntegration(sync, syncConfig, syncRunId),
    },
    destinations: {
      postgres: new DestinationPostgresInternalIntegration(sync, syncConfig, syncRunId),
      webhook: new DestinationWebhookInternalIntegration(sync, syncConfig, syncRunId),
    },
  };
};
