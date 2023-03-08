export type Application = {
  id: string;
  config: ApplicationConfig;
};

export type ApplicationConfig = {
  webhook: WebhookConfig;
};

export type WebhookConfig = {
  url: string | null;
  notifyOnSyncSuccess: boolean;
  notifyOnSyncError: boolean;
  notifyOnConnectionSuccess: boolean;
  notifyOnConnectionError: boolean;
};
