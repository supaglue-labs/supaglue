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
