import { LekkoHydrater } from '@lekko/react-sdk';
import { getEntitiesWhitelistConfig, getSchemasWhitelistConfig } from './lekko';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_LEKKO_CLIENT_API_KEY,
  repositoryName: 'supaglue-test',
  repositoryOwner: 'lekkodev',
};

export const lekkoHydrater = new LekkoHydrater(settings, [getEntitiesWhitelistConfig(), getSchemasWhitelistConfig()]);
