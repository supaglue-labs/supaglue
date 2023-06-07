import type { Prisma, Provider as ProviderModel } from '@supaglue/db';
import {
  Provider,
  ProviderCategory,
  ProviderConfigDecrypted,
  ProviderConfigEncrypted,
  ProviderCreateParams,
  ProviderName,
} from '@supaglue/types';
import { decryptFromString, encryptAsString } from '../lib/crypt';

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
    config: await fromProviderConfigModel(config),
  } as Provider; // TODO: better type;
};

const fromProviderConfigModel = async (config: Prisma.JsonValue): Promise<ProviderConfigDecrypted> => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Provider config is missing');
  }
  const providerConfig = config as unknown as ProviderConfigEncrypted;
  return {
    ...providerConfig,
    oauth: {
      ...providerConfig.oauth,
      credentials: JSON.parse(await decryptFromString(providerConfig.oauth.credentials)),
    },
  };
};

export const toProviderModel = async ({ applicationId, category, authType, name, config }: ProviderCreateParams) => {
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
  };
};
