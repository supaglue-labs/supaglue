import { WebhookConfig } from './webhook';

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

export type ApplicationCreateParams = {
  name: string;
  orgId: string;
};
export type ApplicationUpdateParams = Partial<BaseApplication>;
