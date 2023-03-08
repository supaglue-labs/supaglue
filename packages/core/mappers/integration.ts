import type { Integration as IntegrationModel } from '@supaglue/db';
import { CRMProviderName, Integration, IntegrationCategory, IntegrationConfig } from '../types';

export const fromIntegrationModel = ({
  id,
  applicationId,
  category,
  providerName,
  config,
}: IntegrationModel): Integration => {
  return {
    id,
    applicationId,
    category: category as IntegrationCategory,
    authType: 'oauth2',
    providerName: providerName as CRMProviderName,
    config: config as IntegrationConfig,
  };
};
