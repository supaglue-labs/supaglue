import { consumeMagicLink } from '@/client';
import Spinner from '@/components/Spinner';
import { useMagicLinkData } from '@/hooks/useMagicLinkData';
import { useNextLambdaEnv } from '@/hooks/useNextLambdaEnv';
import providerToIcon from '@/utils/providerToIcon';
import { Box, Button, Card, Grid, Stack, TextField, Typography } from '@mui/material';
import type { ProviderName } from '@supaglue/types';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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

  if (data.code === 'magic_link_valid' && data.magicLink.authType === 'api_key') {
    return (
      <ApiKeyCard
        returnUrl={data.magicLink.returnUrl}
        linkId={data.magicLink.id}
        providerName={data.magicLink.providerName}
      />
    );
  }

  if (data.code === 'magic_link_valid' && data.magicLink.authType === 'access_key_secret') {
    return (
      <AccessKeySecretCard
        returnUrl={data.magicLink.returnUrl}
        linkId={data.magicLink.id}
        providerName={data.magicLink.providerName}
      />
    );
  }

  // TODO: Implement ms365
  return <ErrorPage errorMessage={data.error} />;
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
  returnUrl: string;
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

type AccessSecretKeyFormProps = {
  linkId: string;
  returnUrl: string;
  providerName: ProviderName;
};

const AccessKeySecretCard = ({ linkId, providerName, returnUrl }: AccessSecretKeyFormProps) => {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState('');
  const [accessKeySecret, setAccessKeySecret] = useState('');
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Grid item xs={3}>
        <Card sx={{ padding: '4rem' }}>
          <Stack direction="column" className="gap-2" sx={{ padding: '2rem' }}>
            <Stack direction="row" spacing={1} className="items-center w-full">
              <Typography variant="subtitle1">Connect to {capitalizeString(providerName)}</Typography>
              {providerToIcon(providerName, 35)}
            </Stack>
          </Stack>
          <Stack className="gap-2">
            <Typography variant="subtitle1">Access Key</Typography>
            <TextField
              required={true}
              value={accessKey}
              size="small"
              label="Access Key"
              variant="outlined"
              helperText={`Enter your ${capitalizeString(providerName)} Access Key`}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setAccessKey(event.target.value);
              }}
            />
            <Typography variant="subtitle1">Access Key Secret</Typography>
            <TextField
              required={true}
              value={accessKeySecret}
              size="small"
              label="Access Key Secret"
              type="password"
              variant="outlined"
              helperText={`Enter your ${capitalizeString(providerName)} Access Key Secret`}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setAccessKeySecret(event.target.value);
              }}
            />
          </Stack>
          <Stack direction="row" className="gap-2 justify-end">
            <Button
              disabled={!accessKey}
              variant="contained"
              onClick={async () => {
                await consumeMagicLink(linkId, { type: 'access_key_secret', accessKey, accessKeySecret });
                await router.push(returnUrl);
              }}
            >
              Save
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

type ApiKeyCardProps = {
  linkId: string;
  returnUrl: string;
  providerName: ProviderName;
};

const ApiKeyCard = ({ linkId, providerName, returnUrl }: ApiKeyCardProps) => {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Grid item xs={3}>
        <Card sx={{ padding: '4rem' }}>
          <Stack direction="column" className="gap-2" sx={{ padding: '2rem' }}>
            <Stack direction="row" spacing={2} className="items-center w-full">
              <Typography variant="subtitle1">Connect to {capitalizeString(providerName)}</Typography>
              {providerToIcon(providerName, 35)}
            </Stack>
          </Stack>
          <Stack className="gap-2">
            <Typography variant="subtitle1">API Key</Typography>
            <TextField
              required={true}
              value={apiKey}
              size="small"
              label="API Key"
              variant="outlined"
              type="password"
              helperText={`Enter your ${capitalizeString(providerName)} API Key`}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setApiKey(event.target.value);
              }}
            />
          </Stack>
          <Stack direction="row" className="gap-2 justify-end">
            <Button
              disabled={!apiKey}
              variant="contained"
              onClick={async () => {
                await consumeMagicLink(linkId, { type: 'api_key', apiKey });
                await router.push(returnUrl);
              }}
            >
              Save
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

function capitalizeString(str: string): string {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
