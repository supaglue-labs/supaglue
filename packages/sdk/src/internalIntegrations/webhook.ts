import { BaseInternalIntegration } from './base';

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type WebhookInternalIntegration = BaseInternalIntegration & {
  type: 'webhook';
  config: {
    url: string;
    requestType: HttpRequestType; // GET, POST, etc.
    headers?: string | string[]; // Authorization header etc.
  };
};
