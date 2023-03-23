type BaseApplication = {
  name: string;
  config: ApplicationConfig;
};

export type Application = BaseApplication & {
  id: string;
  orgId: string;
};

export type ApplicationConfig = {
  webhook: WebhookConfig | null;
  apiKey: string | null;
};

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type WebhookConfig = {
  url: string;
  requestType: HttpRequestType; // GET, POST, etc.
  notifyOnSyncSuccess: boolean;
  notifyOnSyncError: boolean;
  notifyOnConnectionSuccess: boolean;
  notifyOnConnectionError: boolean;
  headers?: Record<string, string | number | boolean>; // Authorization header etc.
};

export type ApplicationCreateParams = {
  name: string;
  orgId: string;
};
export type ApplicationUpdateParams = Partial<BaseApplication>;

export type WebhookPayloadType = 'CONNECTION_SUCCESS' | 'CONNECTION_ERROR' | 'SYNC_SUCCESS' | 'SYNC_ERROR';

export type WebhookPayload = {
  customerId: string;
} & Record<string, any>;
