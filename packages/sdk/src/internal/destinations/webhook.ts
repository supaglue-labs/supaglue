import { WebhookInternalIntegration } from '../base';

export type WebhookDestination = WebhookInternalIntegration;

export function webhook(params: Omit<WebhookDestination, 'type'>): WebhookDestination {
  return {
    type: 'webhook',
    ...params,
  };
}
