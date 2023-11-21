import type { WebhookConfig } from './webhook';

type BaseApplication = {
  name: string;
  environment: string;
  isPaid: boolean;
  config: ApplicationConfig;
  email: string | null;
  createdAt: string;
};

export type Application = BaseApplication & {
  id: string;
  orgId: string;
};

export type ApplicationConfig = {
  webhook: WebhookConfig | null;
  apiKey: string | null;
};

export type ApplicationUpsertParams = {
  name: string;
  orgId: string;
};
export type ApplicationUpdateParams = Partial<BaseApplication>;
