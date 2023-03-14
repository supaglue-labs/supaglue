import { sendWebhookPayload } from '@supaglue/core/lib/webhook';
import { ApplicationService, ConnectionService, IntegrationService } from '@supaglue/core/services';

export function createMaybeSendSyncFinishWebhook({
  connectionService,
  integrationService,
  applicationService,
}: {
  connectionService: ConnectionService;
  integrationService: IntegrationService;
  applicationService: ApplicationService;
}) {
  return async function maybeSendSyncFinishWebhook({
    historyId,
    connectionId,
    status,
    numRecordsSynced,
    errorMessage,
  }: {
    historyId: number;
    connectionId: string;
    status: 'SYNC_SUCCESS' | 'SYNC_ERROR';
    numRecordsSynced: number;
    errorMessage?: string;
  }) {
    const connection = await connectionService.getSafeById(connectionId);
    const integration = await integrationService.getById(connection.integrationId);
    const { config } = await applicationService.getById(integration.applicationId);
    if (config.webhook) {
      await sendWebhookPayload(config.webhook, status, {
        connectionId,
        historyId,
        numRecordsSynced,
        errorMessage,
      });
    }
  };
}
