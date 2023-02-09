import { RetryPolicy } from '../../retry_policy';
import { Schema } from '../../schema';

export type BaseInternalIntegration = {
  schema: Schema;

  // TODO: Need to properly figure out where to put this abstraction when we spend more time on
  // IntegrationSDK and retries/rate limits.
  retryPolicy?: RetryPolicy;
};
