import { maybeSendWebhookPayload } from '@supaglue/core/lib/webhook';
import type { ConnectionService, ProviderService } from '@supaglue/core/services';
import type { ApplicationService } from '../services';

export type MaybeSendEntitySyncFinishWebhookArgs = {
  historyId: string;
  connectionId: string;
  status: 'SYNC_SUCCESS' | 'SYNC_ERROR';
  numRecordsSynced: number;
  errorMessage?: string;
  entityId: string;
};

export function createMaybeSendEntitySyncFinishWebhook({
  connectionService,
  providerService,
  applicationService,
}: {
  connectionService: ConnectionService;
  providerService: ProviderService;
  applicationService: ApplicationService;
}) {
  return async function maybeSendEntitySyncFinishWebhook(args: MaybeSendEntitySyncFinishWebhookArgs) {
    const { connectionId, status } = args;
    const connection = await connectionService.getSafeById(connectionId);
    const provider = await providerService.getById(connection.providerId);
    const { config } = await applicationService.getById(provider.applicationId);
    if (config.webhook) {
      await maybeSendWebhookPayload(config.webhook, status, {
        customerId: connection.customerId,
        providerName: connection.providerName,
        ...args,
      });
    }
  };
}
