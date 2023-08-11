import Header from '@/layout/Header';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { buildClerkProps, getAuth } from '@clerk/nextjs/server';
import { Box, Button, Stack, Typography } from '@mui/material';
import { type GetServerSideProps } from 'next';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { useState } from 'react';
import { Svix } from 'svix';
import { IS_CLOUD } from '../../api';

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

  return {
    props: { session, signedIn: true, svixDashboardUrl, ...buildClerkProps(req) },
  };
};

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Getting Started" onDrawerToggle={handleDrawerToggle} />
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
