import { BaseDestination, BaseDestinationParams } from './base';

type HTTPMethods = 'GET' | 'POST' | 'PUT' | 'PATCH';

type WebhookDestinationConfig = {
  url: string;
  method: HTTPMethods;
  header?: string; // not sure what this is supposed to be
};

type DestinationParams = BaseDestinationParams & {
  config: WebhookDestinationConfig;
};

export function destination(params: DestinationParams) {
  return new WebhookDestination(params);
}

class WebhookDestination extends BaseDestination {
  config: WebhookDestinationConfig;

  constructor(params: DestinationParams) {
    super(params);
    const { config } = params;
    this.config = config;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      config: this.config,
    };
  }
}
