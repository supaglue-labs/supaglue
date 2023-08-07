import Spinner from '@/components/Spinner';
import { useMagicLinkData } from '@/hooks/useMagicLinkData';
import { useNextLambdaEnv } from '@/hooks/useNextLambdaEnv';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { GetServerSideProps } from 'next';
import { redirect } from 'next/navigation';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { session: null, signedIn: false },
  };
};

export default function Home() {
  const { data, isLoading, error } = useMagicLinkData();

  if (isLoading) {
    return <Spinner />;
  }

  if (!data || error) {
    return <ErrorPage errorMessage={error?.message} />;
  }

  if (data.code === 'magic_link_expired') {
    return <ErrorPage errorMessage="Magic link expired." />;
  }

  if (data.code === 'magic_link_already_used') {
    return <ErrorPage errorMessage="This magic link has already been consumed." />;
  }

  if (
    data.code === 'magic_link_valid' &&
    data.magicLink.authType === 'oauth2' &&
    data.magicLink.providerName !== 'ms_dynamics_365_sales'
  ) {
    return (
      <Oauth2RedirectPage
        applicationId={data.magicLink.applicationId}
        customerId={data.magicLink.customerId}
        providerName={data.magicLink.providerName}
        returnUrl={data.magicLink.returnUrl}
      />
    );
  }

  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
    </>
  );
}

const ErrorPage = ({ errorMessage = 'Unknown error.' }) => {
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <Stack>
            <Box>
              <Typography variant="h5">Error: {errorMessage} </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

type Oauth2RedirectPageProps = {
  applicationId: string;
  customerId: string;
  providerName: string;
  returnUrl?: string;
};

const Oauth2RedirectPage = ({ applicationId, customerId, providerName, returnUrl }: Oauth2RedirectPageProps) => {
  const { nextLambdaEnv } = useNextLambdaEnv();
  const oauthUrl = `${
    nextLambdaEnv?.API_HOST
  }/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
    customerId
  )}&returnUrl=${returnUrl}&providerName=${providerName}`;

  return redirect(oauthUrl);
};
