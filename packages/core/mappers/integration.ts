import type { Integration as IntegrationModel, Prisma } from '@supaglue/db';
import {
  Integration,
  IntegrationCategory,
  IntegrationConfigDecrypted,
  IntegrationConfigEncrypted,
  IntegrationCreateParams,
  ProviderName,
} from '@supaglue/types';
import { decryptFromString, encryptAsString } from '../lib/crypt';

export const fromIntegrationModel = async ({
  id,
  applicationId,
  category,
  providerName,
  config,
}: IntegrationModel): Promise<Integration> => {
  // TODO: We should update the prisma schema
  if (!config) {
    throw new Error('Integration config is missing');
  }

  return {
    id,
    applicationId,
    category: category as IntegrationCategory,
    authType: 'oauth2',
    providerName: providerName as ProviderName,
    config: await fromIntegrationConfigModel(config),
  };
};

const fromIntegrationConfigModel = async (config: Prisma.JsonValue): Promise<IntegrationConfigDecrypted> => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Integration config is missing');
  }
  const integrationConfig = config as unknown as IntegrationConfigEncrypted;
  return {
    ...integrationConfig,
    oauth: {
      ...integrationConfig.oauth,
      credentials: JSON.parse(await decryptFromString(integrationConfig.oauth.credentials)),
    },
  };
};

export const toIntegrationModel = async ({
  applicationId,
  category,
  authType,
  providerName,
  config,
}: IntegrationCreateParams) => {
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
            credentials: await encryptAsString(JSON.stringify(config.oauth.credentials)),
          },
        }
      : undefined,
  };
};
