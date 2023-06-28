import type { Prisma, Provider as ProviderModel } from '@supaglue/db';
import {
  Provider,
  ProviderCategory,
  ProviderConfigDecrypted,
  ProviderConfigEncrypted,
  ProviderConfigMapperArgs,
  ProviderCreateParams,
  ProviderName,
} from '@supaglue/types';
import { decryptFromString, encryptAsString } from '../lib/crypt';
import { managedOAuthConfigs } from './lib/managed_oauth_configs';

export const hideManagedOauthConfig = (providerConfig: Provider): Provider => {
  return {
    ...providerConfig,
    config: {
      ...providerConfig.config,
      oauth: {
        ...providerConfig.config.oauth,
        credentials: {
          oauthClientId: providerConfig.config.useManagedOauth
            ? ''
            : providerConfig.config.oauth.credentials.oauthClientId,
          oauthClientSecret: providerConfig.config.useManagedOauth
            ? ''
            : providerConfig.config.oauth.credentials.oauthClientSecret,
        },
      },
    },
  };
};

export const fromProviderModel = async ({
  id,
  applicationId,
  category,
  name,
  config,
}: ProviderModel): Promise<Provider> => {
  return {
    id,
    applicationId,
    category: category as ProviderCategory,
    authType: 'oauth2',
    name: name as ProviderName,
    config: await fromProviderConfigModel(config, {
      managedOauthConfig: managedOAuthConfigs[name],
    }),
  } as Provider; // TODO: better type;
};

const fromProviderConfigModel = async (
  config: Prisma.JsonValue,
  args: ProviderConfigMapperArgs
): Promise<ProviderConfigDecrypted> => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Provider config is missing');
  }
  const providerConfig = config as unknown as ProviderConfigEncrypted;
  const { managedOauthConfig } = args;

  const mappedProviderConfig = {
    ...providerConfig,
    oauth: {
      ...providerConfig.oauth,
      ...(providerConfig.useManagedOauth
        ? managedOauthConfig
        : {
            credentials: JSON.parse(await decryptFromString(providerConfig.oauth.credentials)),
          }),
    },
  };

  return mappedProviderConfig;
};

export const toProviderModel = async ({
  applicationId,
  category,
  authType,
  name,
  config,
  objects,
}: ProviderCreateParams) => {
  return {
    applicationId,
    category,
    authType,
    name,
    config: {
      ...config,
      oauth: {
        ...config.oauth,
        credentials: await encryptAsString(JSON.stringify(config.oauth.credentials)),
      },
    },
    objects,
  };
};
