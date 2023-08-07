import { consumeMagicLink } from '@/client';
import Spinner from '@/components/Spinner';
import { useMagicLinkData } from '@/hooks/useMagicLinkData';
import { useNextLambdaEnv } from '@/hooks/useNextLambdaEnv';
import { Box, Stack, Typography } from '@mui/material';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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

  if (
    data.code === 'magic_link_expired' ||
    data.code === 'magic_link_not_found' ||
    data.code === 'magic_link_already_used'
  ) {
    return <ErrorPage errorMessage={data.error} />;
  }

  if (
    data.code === 'magic_link_valid' &&
    data.magicLink.authType === 'oauth2' &&
    data.magicLink.providerName !== 'ms_dynamics_365_sales'
  ) {
    return (
      <Oauth2RedirectPage
        linkId={data.magicLink.id}
        applicationId={data.magicLink.applicationId}
        customerId={data.magicLink.customerId}
        providerName={data.magicLink.providerName}
        returnUrl={data.magicLink.returnUrl}
      />
    );
  }

  // TODO: Implement ms365, api key, and access key flows
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <Stack>
            <Box>
              <Typography variant="h5">Not implemented yet</Typography>
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
              <Typography color="red" variant="h5">
                Error: {errorMessage}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
};
type Oauth2RedirectPageProps = {
  linkId: string;
  applicationId: string;
  customerId: string;
  providerName: string;
  returnUrl?: string;
};

const Oauth2RedirectPage = ({
  linkId,
  applicationId,
  customerId,
  providerName,
  returnUrl,
}: Oauth2RedirectPageProps) => {
  const router = useRouter();

  const { nextLambdaEnv, isLoading } = useNextLambdaEnv();

  useEffect(() => {
    void (async () => {
      if (!nextLambdaEnv?.API_HOST) {
        return;
      }
      const oauthUrl = `${
        nextLambdaEnv.API_HOST
      }/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
        customerId
      )}&returnUrl=${returnUrl}&providerName=${providerName}`;

      await consumeMagicLink(linkId);
      await router.push(oauthUrl);
    })();
  }, [nextLambdaEnv?.API_HOST, router, linkId, applicationId, customerId, providerName, returnUrl]);

  if (isLoading) {
    return <Spinner />;
  }

  return null;
};
