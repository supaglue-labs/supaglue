import { maybeSendWebhookPayload } from '@supaglue/core/lib/webhook';
import type { ConnectionService, ProviderService, WebhookService } from '@supaglue/core/services';
import { snakecaseKeys } from '@supaglue/utils';
import type { ApplicationService } from '../services';

export type MaybeSendSyncFinishWebhookArgs = {
  historyId: string;
  connectionId: string;
  status: 'SYNC_SUCCESS' | 'SYNC_ERROR';
  numRecordsSynced: number;
  errorMessage?: string;
} & (
  | {
      type: 'object';
      objectType: 'common' | 'standard';
      object: string;
    }
  | {
      type: 'entity';
      entityId: string;
    }
);

export function createMaybeSendSyncFinishWebhook({
  connectionService,
  providerService,
  applicationService,
  webhookService,
}: {
  connectionService: ConnectionService;
  providerService: ProviderService;
  applicationService: ApplicationService;
  webhookService: WebhookService;
}) {
  return async function maybeSendSyncFinishWebhook(args: MaybeSendSyncFinishWebhookArgs) {
    const { connectionId } = args;
    const connection = await connectionService.getSafeById(connectionId);
    const provider = await providerService.getById(connection.providerId);
    const application = await applicationService.getById(provider.applicationId);
    const { config } = application;

    const { status, ...argsWithoutStatus } = args;

    await webhookService.sendMessage(
      'sync.complete',
      {
        ...snakecaseKeys({
          ...argsWithoutStatus,
          customerId: connection.customerId,
          providerName: provider.name,
        }),
        result: status === 'SYNC_SUCCESS' ? 'SUCCESS' : 'ERROR',
      },
      application,
      args.historyId
    );

    // TODO remove this after all customers migrate to the svix webhooks
    if (config.webhook) {
      await maybeSendWebhookPayload(config.webhook, status, {
        customerId: connection.customerId,
        providerName: connection.providerName,
        ...args,
      });
    }
  };
}
