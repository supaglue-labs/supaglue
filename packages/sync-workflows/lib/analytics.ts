import { CommonModel, CRMProviderName } from '@supaglue/core/types';
import fs from 'fs';
import path from 'path';
import { PostHog } from 'posthog-node';

const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const analytics = new PostHog(process.env.SUPAGLUE_POSTHOG_API_KEY ?? 'dummy', { enable: true });

export const logEvent = (
  eventName: string,
  providerName: CRMProviderName,
  modelName: CommonModel,
  sessionId?: string,
  isSuccess = true
): void => {
  if (!sessionId) {
    return;
  }

  analytics.capture({
    distinctId: sessionId,
    event: eventName,
    properties: {
      result: isSuccess ? 'success' : 'error',
      params: {
        modelName,
        providerName,
      },
      source: 'sync-workflows',
      system: {
        version,
        arch: process.arch,
        os: process.platform,
        nodeVersion: process.version,
      },
    },
  });
};
