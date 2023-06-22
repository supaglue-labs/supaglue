import { maybeSendWebhookPayload } from '@supaglue/core/lib/webhook';
import { ConnectionService, ProviderService } from '@supaglue/core/services';
import { CommonModelType } from '@supaglue/types/common';
import { ApplicationService } from '../services';

export type MaybeSendSyncFinishWebhookArgs = {
  historyId: string;
  connectionId: string;
  status: 'SYNC_SUCCESS' | 'SYNC_ERROR';
  numRecordsSynced: number;
  errorMessage?: string;
} & (
  | {
      commonModel: CommonModelType;
    }
  | {
      standardObject: string;
    }
  | {
      customObject: string;
    }
);

export function createMaybeSendSyncFinishWebhook({
  connectionService,
  providerService,
  applicationService,
}: {
  connectionService: ConnectionService;
  providerService: ProviderService;
  applicationService: ApplicationService;
}) {
  return async function maybeSendSyncFinishWebhook(args: MaybeSendSyncFinishWebhookArgs) {
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
