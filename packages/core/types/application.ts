type BaseApplication = {
  name: string;
  config: ApplicationConfig;
};

export type Application = BaseApplication & {
  id: string;
  name: string;
  config: ApplicationConfig;
};

export type ApplicationConfig = {
  webhook: WebhookConfig | null;
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

export type ApplicationCreateParams = BaseApplication;
export type ApplicationUpdateParams = Partial<BaseApplication>;
