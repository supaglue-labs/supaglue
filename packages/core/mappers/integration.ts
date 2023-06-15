import type { Integration as IntegrationModel, Prisma } from '@supaglue/db';
import {
  Integration,
  IntegrationConfigDecrypted,
  IntegrationConfigEncrypted,
  IntegrationConfigMapperArgs,
  IntegrationCreateParams,
  ProviderCategory,
  ProviderName,
} from '@supaglue/types';
import { decryptFromString, encryptAsString } from '../lib/crypt';
import { managedOAuthConfigs } from './lib/managed_oauth_configs';

export const hideIntegrationManagedOauthConfig = (integration: Integration): Integration => {
  return {
    ...integration,
    config: {
      ...integration.config,
      oauth: {
        ...integration.config.oauth,
        credentials: {
          oauthClientId: integration.config.useManagedOauth ? '' : integration.config.oauth.credentials.oauthClientId,
          oauthClientSecret: integration.config.useManagedOauth
            ? ''
            : integration.config.oauth.credentials.oauthClientSecret,
        },
      },
    },
  };
};

export const fromIntegrationModel = async ({
  id,
  applicationId,
  destinationId,
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
    destinationId,
    category: category as ProviderCategory,
    authType: 'oauth2',
    providerName: providerName as ProviderName,
    config: await fromIntegrationConfigModel(config, {
      managedOauthConfig: managedOAuthConfigs[providerName],
    }),
  } as Integration; // TODO: better type;
};

const fromIntegrationConfigModel = async (
  config: Prisma.JsonValue,
  args: IntegrationConfigMapperArgs
): Promise<IntegrationConfigDecrypted> => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Integration config is missing');
  }
  const integrationConfig = config as unknown as IntegrationConfigEncrypted;
  const { managedOauthConfig } = args;

  const mappedIntegrationConfig = {
    ...integrationConfig,
    oauth: {
      ...integrationConfig.oauth,
      ...(integrationConfig.useManagedOauth
        ? managedOauthConfig
        : {
            credentials: JSON.parse(await decryptFromString(integrationConfig.oauth.credentials)),
          }),
    },
  };

  return mappedIntegrationConfig;
};

export const toIntegrationModel = async ({
  applicationId,
  destinationId,
  category,
  authType,
  providerName,
  config,
}: IntegrationCreateParams) => {
  return {
    applicationId,
    category,
    authType,
    destinationId,
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
