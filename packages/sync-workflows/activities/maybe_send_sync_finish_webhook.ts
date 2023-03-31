import { sendWebhookPayload } from '@supaglue/core/lib/webhook';
import { ApplicationService, ConnectionService, IntegrationService } from '@supaglue/core/services';
import { CommonModel } from '@supaglue/types/common';

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
    commonModel,
    errorMessage,
  }: {
    historyId: string;
    connectionId: string;
    status: 'SYNC_SUCCESS' | 'SYNC_ERROR';
    numRecordsSynced: number;
    commonModel: CommonModel;
    errorMessage?: string;
  }) {
    const connection = await connectionService.getSafeById(connectionId);
    const integration = await integrationService.getById(connection.integrationId);
    const { config } = await applicationService.getById(integration.applicationId);
    if (config.webhook) {
      await sendWebhookPayload(config.webhook, status, {
        connectionId,
        customerId: connection.customerId,
        historyId,
        numRecordsSynced,
        commonModel,
        errorMessage,
      });
    }
  };
}
