import { WebhookDestination } from '@supaglue/types';

export function webhook(params: Omit<WebhookDestination, 'type'>): WebhookDestination {
  return {
    type: 'webhook',
    ...params,
  };
}
