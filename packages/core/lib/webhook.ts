import { WebhookConfig, WebhookPayload } from '@supaglue/types';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import axios from 'axios';
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
    const { url, requestType, headers } = config;
    const data = { type: payloadType, payload: snakecaseKeys(payload) };

    switch (requestType) {
      case 'GET':
        return await axios.get(url, {
          headers,
          data,
          timeout: WEBHOOK_TIMEOUT,
        });
      case 'POST':
        return await axios.post(url, data, { headers, timeout: WEBHOOK_TIMEOUT });
      case 'PATCH':
        return await axios.patch(url, data, { headers, timeout: WEBHOOK_TIMEOUT });
      case 'PUT':
        return await axios.put(url, data, { headers, timeout: WEBHOOK_TIMEOUT });
      case 'DELETE':
        return await axios.delete(url, {
          headers,
          data,
          timeout: WEBHOOK_TIMEOUT,
        });
      default:
        throw new Error(`Unsupported requestType: ${requestType}`);
    }
  } catch (e) {
    // TODO: Don't swallow this error.
    logger.error(e, 'Failed to send webhook');
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
