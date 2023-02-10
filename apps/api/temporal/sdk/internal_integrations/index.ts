import { SyncConfig } from '../../../developer_config/entities';
import { Sync } from '../../../syncs/entities';
import { PostgresDestinationInternalIntegration, PostgresSourceInternalIntegration } from './postgres';
import { WebhookDestinationInternalIntegration } from './webhook';

export type InternalIntegrations = {
  sources: {
    postgres: PostgresSourceInternalIntegration;
  };
  destinations: {
    postgres: PostgresDestinationInternalIntegration;
    webhook: WebhookDestinationInternalIntegration;
  };
};

export const createInternalIntegrations = (sync: Sync, syncConfig: SyncConfig, syncRunId: string) => {
  return {
    sources: {
      postgres: new PostgresSourceInternalIntegration(sync, syncConfig, syncRunId),
    },
    destinations: {
      postgres: new PostgresDestinationInternalIntegration(sync, syncConfig, syncRunId),
      webhook: new WebhookDestinationInternalIntegration(sync, syncConfig, syncRunId),
    },
  };
};
