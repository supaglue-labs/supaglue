import { WebhookConfig, WebhookPayload } from '@supaglue/types';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import axios from 'axios';
import { logger } from './logger';

export type WebhookPayloadType = 'CONNECTION_SUCCESS' | 'CONNECTION_ERROR' | 'SYNC_SUCCESS' | 'SYNC_ERROR';

export const sendWebhookPayload = async (
  config: WebhookConfig,
  payloadType: WebhookPayloadType,
  payload: WebhookPayload
) => {
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
        });
      case 'POST':
        return await axios.post(url, data, { headers });
      case 'PATCH':
        return await axios.patch(url, data, { headers });
      case 'PUT':
        return await axios.put(url, data, { headers });
      case 'DELETE':
        return await axios.delete(url, {
          headers,
          data,
        });
      default:
        throw new Error(`Unsupported requestType: ${requestType}`);
    }
  } catch (e) {
    logger.error(e, 'Failed to send webhook');
  }
};
