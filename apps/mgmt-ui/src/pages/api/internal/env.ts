import { ClientContext, initAPIClient } from '@lekko/node-server-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, IS_CLOUD, LEKKO_API_KEY } from '..';

type HomeCtaButton = { buttonMessage: string; buttonLink: string };

// NOTE: the env variables passed back here are public
export type SupagluePublicNextEnv = {
  API_HOST: string;
  IS_CLOUD: boolean;
  CLERK_ACCOUNT_URL: string;
  CLERK_ORGANIZATION_URL: string;
  homeCtaButtonConfig: HomeCtaButton;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<SupagluePublicNextEnv>) {
  // Lekko defaults
  let homeCtaButtonConfig: HomeCtaButton = {
    buttonMessage: 'Quickstart Guide',
    buttonLink: 'https://docs.supaglue.io/docs/quickstart',
  };

  if (process.env.LEKKO_API_KEY) {
    const client = await initAPIClient({
      apiKey: LEKKO_API_KEY,
      repositoryOwner: 'supaglue-labs',
      repositoryName: 'dynamic-config',
    });

    homeCtaButtonConfig = (await client.getJSONFeature('mgmt-ui', 'home_cta', new ClientContext())) as HomeCtaButton;
  }

  const CLERK_ACCOUNT_URL =
    API_HOST === 'https://api.supaglue.io'
      ? 'https://accounts.supaglue.io/user'
      : 'https://witty-eft-29.accounts.dev/user';

  const CLERK_ORGANIZATION_URL =
    API_HOST === 'https://api.supaglue.io'
      ? 'https://accounts.supaglue.io/user'
      : 'https://witty-eft-29.accounts.dev/user';

  return res.status(200).json({
    API_HOST,
    IS_CLOUD,
    CLERK_ACCOUNT_URL,
    CLERK_ORGANIZATION_URL,
    homeCtaButtonConfig,
  });
}
