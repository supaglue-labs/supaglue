import type { Integration as IntegrationModel } from '@supaglue/db';
import { CRMProviderName, Integration, IntegrationCategory, IntegrationConfig } from '../types';

export const fromIntegrationModel = ({
  id,
  applicationId,
  isEnabled,
  category,
  providerName,
  config,
}: IntegrationModel): Integration => {
  return {
    id,
    applicationId,
    isEnabled,
    category: category as IntegrationCategory,
    authType: 'oauth2',
    providerName: providerName as CRMProviderName,
    config: config as IntegrationConfig,
  };
};
