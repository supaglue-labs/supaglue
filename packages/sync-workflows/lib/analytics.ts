import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import type { ProviderName } from '@supaglue/types';

export const logEvent = ({
  distinctId,
  eventName,
  providerName,
  modelName,
  entityId,
  syncId,
  applicationId,
  applicationEnv,
  numRecordsSynced,
  isSuccess = true,
}: {
  distinctId: string;
  eventName: string;
  providerName: ProviderName;
  modelName?: string;
  entityId?: string;
  syncId: string;
  applicationId: string;
  applicationEnv: string;
  numRecordsSynced?: number;
  isSuccess?: boolean;
}): void => {
  posthogClient.capture({
    distinctId,
    event: eventName,
    properties: {
      result: isSuccess ? 'success' : 'error',
      params: {
        modelName,
        entityId,
        providerName,
        numRecordsSynced,
        syncId,
        applicationId,
        applicationEnv,
      },
      source: 'sync-workflows',
      system: getSystemProperties(),
    },
  });
};
