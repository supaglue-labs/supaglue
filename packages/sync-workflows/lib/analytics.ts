import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import { CommonModel, CRMProviderName } from '@supaglue/core/types';

export const logEvent = (
  eventName: string,
  providerName: CRMProviderName,
  modelName: CommonModel,
  isSuccess = true
): void => {
  if (!distinctId) {
    return;
  }

  posthogClient.capture({
    distinctId,
    event: eventName,
    properties: {
      result: isSuccess ? 'success' : 'error',
      params: {
        modelName,
        providerName,
      },
      source: 'sync-workflows',
      system: getSystemProperties(),
    },
  });
};
