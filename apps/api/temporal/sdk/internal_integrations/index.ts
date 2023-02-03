import { PostgresInternalIntegration } from './postgres';
import { WebhookInternalIntegration } from './webhook';

export type InternalIntegrations = {
  postgres: PostgresInternalIntegration;
  webhook: WebhookInternalIntegration;
};

export const internalIntegrations = {
  postgres: new PostgresInternalIntegration(),
  webhook: new WebhookInternalIntegration(),
};
