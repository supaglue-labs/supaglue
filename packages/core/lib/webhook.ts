import axios from 'axios';
import { WebhookConfig } from '../types';
import { logger } from './logger';

export type WebhookPayloadType = 'CONNECTION_SUCCESS' | 'CONNECTION_ERROR' | 'SYNC_SUCCESS' | 'SYNC_ERROR';

export const sendWebhookPayload = async (
  config: WebhookConfig,
  payloadType: WebhookPayloadType,
  payload: Record<string, any>
) => {
  // Note: this is best effort.
  // TODO: Make webhooks more durable
  try {
    const { url, requestType, headers } = config;
    const axiosRequest = {
      data: { type: payloadType, payload },
      headers,
    };

    switch (requestType) {
      case 'GET':
        return await axios.get(url, axiosRequest);
      case 'POST':
        return await axios.post(url, axiosRequest);
      case 'PATCH':
        return await axios.patch(url, axiosRequest);
      case 'PUT':
        return await axios.put(url, axiosRequest);
      case 'DELETE':
        return await axios.delete(url, axiosRequest);
      default:
        throw new Error(`Unsupported requestType: ${requestType}`);
    }
  } catch (e) {
    logger.error(`Failed to send webhook: ${e}`);
  }
};
