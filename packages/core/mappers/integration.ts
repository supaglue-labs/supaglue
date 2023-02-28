import { Integration as IntegrationModel } from '@prisma/client';
import { CRMProviderName, Integration, IntegrationCategory, IntegrationConfig } from '../types';

export const fromIntegrationModel = ({ id, category, providerName, config }: IntegrationModel): Integration => {
  return {
    id,
    category: category as IntegrationCategory,
    authType: 'oauth2',
    providerName: providerName as CRMProviderName,
    config: config as IntegrationConfig,
  };
};
