import { BaseDestination, BaseDestinationParams } from '../base';

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type WebhookDestinationConfig = {
  url: string;
  requestType: HttpRequestType;
  headers?: string | string[];
};

type WebhookDestinationParams = BaseDestinationParams & {
  config: WebhookDestinationConfig;
};

export class WebhookDestination extends BaseDestination {
  config: WebhookDestinationConfig;

  constructor(params: WebhookDestinationParams) {
    super(params);
    const { config } = params;
    this.config = config;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'webhook',
      config: this.config,
    };
  }
}

export function webhook(params: WebhookDestinationParams) {
  return new WebhookDestination(params);
}
