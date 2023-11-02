import Header from '@/layout/Header';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { buildClerkProps, getAuth } from '@clerk/nextjs/server';
import { Box, Button, Stack, Typography } from '@mui/material';
import { type GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { useState } from 'react';
import { API_HOST, IS_CLOUD, SVIX_API_TOKEN } from '../../api';

//
// Lekkodefaults
//

type HomeCtaButton = {
  buttonMessage: string;
  buttonLink: string;
};

type EntitiesWhitelist = {
  applicationIds: string[];
};

type SchemasWhitelist = {
  applicationIds: string[];
};

//
// server side props
//

export type SupaglueProps = {
  session: Session | null;
  signedIn: boolean;
  svixDashboardUrl: string | null;
} & PublicEnvProps &
  Record<string, unknown>;

export type PublicEnvProps = {
  API_HOST: string;
  IS_CLOUD: boolean;
  CLERK_ACCOUNT_URL: string;
  CLERK_ORGANIZATION_URL: string;
  SVIX_API_TOKEN?: string;
  lekko: {
    homeCtaButtonConfig: HomeCtaButton;
    entitiesWhitelistConfig: EntitiesWhitelist;
    schemasWhitelistConfig: SchemasWhitelist;
  };
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, resolvedUrl }) => {
  let session: Session | null = null;

  if (!IS_CLOUD) {
    session = await getServerSession(req, res, authOptions);

    if (!session) {
      return {
        redirect: {
          destination: '/api/auth/signin',
          permanent: false,
        },
      };
    }
  } else {
    const { userId } = getAuth(req);
    if (!userId) {
      return {
        redirect: {
          destination: '/sign-in?redirect_url=' + resolvedUrl,
          permanent: false,
        },
      };
    }
  }

  // Lekko defaults
  const homeCtaButtonConfig: HomeCtaButton = {
    buttonMessage: 'Quickstart Guide',
    buttonLink: 'https://docs.supaglue.io/docs/quickstart',
  };

  const entitiesWhitelistConfig: EntitiesWhitelist = {
    applicationIds: ['aba75b64-19ca-47c6-bb48-196911d8a18b', '82ff8465-2a09-499b-94c1-6d386502d14a'],
  };

  const schemasWhitelistConfig: SchemasWhitelist = {
    applicationIds: [
      '7a695ded-b46d-406b-bd19-6e571880be74',
      'adbb1d52-273a-447c-891f-d3e299e45ddc',
      '39a890de-8dc7-4bdb-9007-e9a856a6b2e0',
      '02572019-cc02-4aa2-a16a-986cff3bf8b4',
      'fa90be4e-5315-4e12-9e2c-72cce4c1b083',
      'd5d45112-d700-42fc-a5d0-cc7bf879f8fb',
      '39e3fe2a-2403-498b-b4be-316a3c3f1bfe',
      'aba75b64-19ca-47c6-bb48-196911d8a18b',
      '82ff8465-2a09-499b-94c1-6d386502d14a',
    ],
  };

  // NOTE: disable for now due to perf in critical page load path
  // if (LEKKO_API_KEY) {
  //   const client = await initAPIClient({
  //     apiKey: LEKKO_API_KEY,
  //     repositoryOwner: 'supaglue-labs',
  //     repositoryName: 'dynamic-config',
  //   });

  //   homeCtaButtonConfig = (await client.getJSONFeature('mgmt-ui', 'home_cta', new ClientContext())) as HomeCtaButton;
  //   entitiesWhitelistConfig = (await client.getJSONFeature(
  //     'mgmt-ui',
  //     'entities_whitelist',
  //     new ClientContext()
  //   )) as EntitiesWhitelist;
  //   schemasWhitelistConfig = (await client.getJSONFeature(
  //     'mgmt-ui',
  //     'schemas_whitelist',
  //     new ClientContext()
  //   )) as SchemasWhitelist;
  // }

  const CLERK_ACCOUNT_URL =
    API_HOST === 'https://api.supaglue.io'
      ? 'https://accounts.supaglue.io/user'
      : 'https://witty-eft-29.accounts.dev/user';

  const CLERK_ORGANIZATION_URL =
    API_HOST === 'https://api.supaglue.io'
      ? 'https://accounts.supaglue.io/organization'
      : 'https://witty-eft-29.accounts.dev/organization';

  return {
    props: {
      session,
      signedIn: true,
      ...buildClerkProps(req),
      API_HOST,
      IS_CLOUD,
      CLERK_ACCOUNT_URL,
      CLERK_ORGANIZATION_URL,
      SVIX_API_TOKEN,
      lekko: { homeCtaButtonConfig, entitiesWhitelistConfig, schemasWhitelistConfig },
    },
  };
};

export default function Home(props: SupaglueProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Getting Started" onDrawerToggle={handleDrawerToggle} {...props} />
      <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
        <Stack>
          <Box>
            <Typography variant="h5">Welcome to the Supaglue Management Portal!</Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              Learn how to sync your customers's data to your database using our guide below.
            </Typography>
          </Box>

          <Box>
            <Box fontSize="2.4rem">
              👉{' '}
              <Button variant="contained" color="primary" href="https://docs.supaglue.com/quickstart">
                Quickstart Guide
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
