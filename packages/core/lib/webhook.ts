import axios from '@supaglue/core/remotes/sg_axios';
import type { WebhookConfig, WebhookPayload } from '@supaglue/types';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { logger } from './logger';

export type WebhookPayloadType = 'CONNECTION_SUCCESS' | 'CONNECTION_ERROR' | 'SYNC_SUCCESS' | 'SYNC_ERROR';

const WEBHOOK_TIMEOUT = 5 * 60 * 1000;

export const maybeSendWebhookPayload = async (
  config: WebhookConfig,
  payloadType: WebhookPayloadType,
  payload: WebhookPayload
) => {
  if (skipSendingWebhook(payloadType, config)) {
    return;
  }
  // Note: this is best effort.
  // TODO: Make webhooks more durable
  try {
    const { url, headers } = config;
    const data = { type: payloadType, payload: snakecaseKeys(payload) };

    return await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: WEBHOOK_TIMEOUT,
    });
  } catch (e) {
    // TODO: Don't swallow this error.
    logger.warn(e, 'Failed to send webhook');
  }
};

const skipSendingWebhook = (type: WebhookPayloadType, config: WebhookConfig): boolean => {
  return (
    (type === 'CONNECTION_ERROR' && !config.notifyOnConnectionError) ||
    (type === 'CONNECTION_SUCCESS' && !config.notifyOnConnectionSuccess) ||
    (type === 'SYNC_ERROR' && !config.notifyOnSyncError) ||
    (type === 'SYNC_SUCCESS' && !config.notifyOnSyncSuccess)
  );
};
