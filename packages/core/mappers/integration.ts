import type { Integration as IntegrationModel, Prisma } from '@supaglue/db';
import { decryptFromString, encryptAsString } from '../lib/crypt';
import {
  CRMIntegrationCreateParams,
  CRMProviderName,
  Integration,
  IntegrationCategory,
  IntegrationConfigDecrypted,
  IntegrationConfigEncrypted,
} from '../types';

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
    config: fromIntegrationConfigModel(config),
  };
};

export const fromIntegrationConfigModel = (config: Prisma.JsonValue | null): IntegrationConfigDecrypted | undefined => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return;
  }
  const integrationConfig = config as unknown as IntegrationConfigEncrypted;
  return {
    ...integrationConfig,
    oauth: {
      ...integrationConfig.oauth,
      credentials: JSON.parse(decryptFromString(integrationConfig.oauth.credentials)),
    },
  };
};

export const toIntegrationModel = ({
  applicationId,
  isEnabled,
  category,
  authType,
  providerName,
  config,
}: CRMIntegrationCreateParams) => {
  return {
    applicationId,
    isEnabled,
    category,
    authType,
    providerName,
    config: config
      ? {
          ...config,
          oauth: {
            ...config.oauth,
            credentials: encryptAsString(JSON.stringify(config.oauth.credentials)),
          },
        }
      : undefined,
  };
};
