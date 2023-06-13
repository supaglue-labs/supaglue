import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import { ProviderName } from '@supaglue/types';

export const logEvent = ({
  eventName,
  providerName,
  modelName,
  syncId,
  numRecordsSynced,
  isSuccess = true,
}: {
  eventName: string;
  providerName: ProviderName;
  modelName: string;
  syncId: string;
  numRecordsSynced?: number;
  isSuccess?: boolean;
}): void => {
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
        numRecordsSynced,
        syncId,
      },
      source: 'sync-workflows',
      system: getSystemProperties(),
    },
  });
};
