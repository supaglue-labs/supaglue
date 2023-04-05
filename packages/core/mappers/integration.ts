import type { Integration as IntegrationModel, Prisma } from '@supaglue/db';
import {
  CRMIntegrationCreateParams,
  CRMProviderName,
  Integration,
  IntegrationCategory,
  IntegrationConfigDecrypted,
  IntegrationConfigEncrypted,
} from '@supaglue/types';
import { decryptFromString, encryptAsString } from '../lib/crypt';

export const fromIntegrationModel = ({
  id,
  applicationId,
  category,
  providerName,
  config,
}: IntegrationModel): Integration => {
  // TODO: We should update the prisma schema
  if (!config) {
    throw new Error('Integration config is missing');
  }

  return {
    id,
    applicationId,
    category: category as IntegrationCategory,
    authType: 'oauth2',
    providerName: providerName as CRMProviderName,
    config: fromIntegrationConfigModel(config),
  };
};

export const fromIntegrationConfigModel = (config: Prisma.JsonValue): IntegrationConfigDecrypted => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Integration config is missing');
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
  category,
  authType,
  providerName,
  config,
}: CRMIntegrationCreateParams) => {
  return {
    applicationId,
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
