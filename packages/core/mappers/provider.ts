import type { Prisma, Provider as ProviderModel } from '@supaglue/db';
import type {
  CRMProviderCreateParams,
  Provider,
  ProviderCategory,
  ProviderConfigMapperArgs,
  ProviderCreateParams,
  ProviderName,
  ProviderOauthConfigDecrypted,
  ProviderOauthConfigEncrypted,
} from '@supaglue/types';
import { decryptFromString, encryptAsString } from '../lib/crypt';
import { managedOAuthConfigs } from './lib/managed_oauth_configs';

export const hideManagedOauthConfig = (providerConfig: Provider): Provider => {
  if (providerConfig.authType !== 'oauth2') {
    return providerConfig;
  }
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

export async function fromProviderModel<T extends Provider = Provider>({
  id,
  applicationId,
  authType,
  category,
  name,
  config,
  objects,
  entityMappings,
}: ProviderModel): Promise<T> {
  return {
    id,
    applicationId,
    category: category as ProviderCategory,
    authType,
    name: name as ProviderName,
    config:
      authType === 'oauth2'
        ? await fromProviderConfigModel(config, {
            managedOauthConfig: managedOAuthConfigs[name],
          })
        : undefined,
    objects: objects ?? undefined,
    entityMappings: entityMappings ?? undefined,
  } as T;
}

const fromProviderConfigModel = async (
  config: Prisma.JsonValue,
  args: ProviderConfigMapperArgs
): Promise<ProviderOauthConfigDecrypted> => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Provider config is missing');
  }
  const providerConfig = config as unknown as ProviderOauthConfigEncrypted;
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

export const toProviderModel = async (params: ProviderCreateParams) => {
  const { applicationId, category, authType, name, objects, entityMappings } = params;
  if (authType === 'api_key' || authType === 'marketo_oauth2') {
    return {
      applicationId,
      category,
      authType,
      name,
      config: {},
      objects,
      entityMappings,
    };
  }
  const { config } = params as CRMProviderCreateParams;
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
    entityMappings,
  };
};
