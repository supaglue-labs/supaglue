import { maybeSendWebhookPayload } from '@supaglue/core/lib/webhook';
import { ConnectionService, ProviderService } from '@supaglue/core/services';
import { CommonModelType } from '@supaglue/types/common';
import { ApplicationService } from 'sync-worker/services';

export function createMaybeSendSyncFinishWebhook({
  connectionService,
  providerService,
  applicationService,
}: {
  connectionService: ConnectionService;
  providerService: ProviderService;
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
    commonModel: CommonModelType;
    errorMessage?: string;
  }) {
    const connection = await connectionService.getSafeById(connectionId);
    const provider = await providerService.getById(connection.providerId);
    const { config } = await applicationService.getById(provider.applicationId);
    if (config.webhook) {
      await maybeSendWebhookPayload(config.webhook, status, {
        connectionId,
        customerId: connection.customerId,
        providerName: connection.providerName,
        historyId,
        numRecordsSynced,
        commonModel,
        errorMessage,
      });
    }
  };
}
