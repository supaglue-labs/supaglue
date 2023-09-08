import Header from '@/layout/Header';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { buildClerkProps, getAuth } from '@clerk/nextjs/server';
import { ClientContext, initAPIClient } from '@lekko/node-server-sdk';
import { Box, Button, Stack, Typography } from '@mui/material';
import { type GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { useState } from 'react';
import { Svix } from 'svix';
import { API_HOST, IS_CLOUD, LEKKO_API_KEY } from '../../api';

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
  lekko: {
    homeCtaButtonConfig: HomeCtaButton;
    entitiesWhitelistConfig: EntitiesWhitelist;
    schemasWhitelistConfig: SchemasWhitelist;
  };
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query, resolvedUrl }) => {
  let session: Session | null = null;
  const applicationId = query.applicationId as string;

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

  let svixDashboardUrl: string | null = null;
  if (process.env.SVIX_API_TOKEN) {
    const svix = new Svix(process.env.SVIX_API_TOKEN, { serverUrl: process.env.SVIX_SERVER_URL });
    svixDashboardUrl = (await svix.authentication.appPortalAccess(applicationId, {})).url;
  }

  // Lekko defaults
  let homeCtaButtonConfig: HomeCtaButton = {
    buttonMessage: 'Quickstart Guide',
    buttonLink: 'https://docs.supaglue.io/docs/quickstart',
  };

  let entitiesWhitelistConfig: EntitiesWhitelist = {
    applicationIds: [],
  };

  let schemasWhitelistConfig: SchemasWhitelist = {
    applicationIds: [],
  };

  if (LEKKO_API_KEY) {
    const client = await initAPIClient({
      apiKey: LEKKO_API_KEY,
      repositoryOwner: 'supaglue-labs',
      repositoryName: 'dynamic-config',
    });

    homeCtaButtonConfig = (await client.getJSONFeature('mgmt-ui', 'home_cta', new ClientContext())) as HomeCtaButton;
    entitiesWhitelistConfig = (await client.getJSONFeature(
      'mgmt-ui',
      'entities_whitelist',
      new ClientContext()
    )) as EntitiesWhitelist;
    schemasWhitelistConfig = (await client.getJSONFeature(
      'mgmt-ui',
      'schemas_whitelist',
      new ClientContext()
    )) as EntitiesWhitelist;
  }

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
      svixDashboardUrl,
      ...buildClerkProps(req),
      API_HOST,
      IS_CLOUD,
      CLERK_ACCOUNT_URL,
      CLERK_ORGANIZATION_URL,
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
