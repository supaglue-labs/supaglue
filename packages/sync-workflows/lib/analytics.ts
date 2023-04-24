import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import { CommonModel } from '@supaglue/types';
import { CRMProviderName } from '@supaglue/types/crm';

export const logEvent = ({
  eventName,
  providerName,
  modelName,
  syncId,
  numRecordsSynced,
  isSuccess = true,
}: {
  eventName: string;
  providerName: CRMProviderName;
  modelName: CommonModel;
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
