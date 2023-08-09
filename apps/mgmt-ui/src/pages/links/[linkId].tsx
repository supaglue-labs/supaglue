import { consumeMagicLink } from '@/client';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useMagicLinkData } from '@/hooks/useMagicLinkData';
import { useNextLambdaEnv } from '@/hooks/useNextLambdaEnv';
import { getDisplayName } from '@/utils/provider';
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
    data.magicLink.providerName !== 'ms_dynamics_365_sales' &&
    data.magicLink.providerName !== 'salesforce'
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

  if (data.code === 'magic_link_valid' && data.magicLink.providerName === 'ms_dynamics_365_sales') {
    return (
      <MsDynamics365Card
        linkId={data.magicLink.id}
        applicationId={data.magicLink.applicationId}
        customerId={data.magicLink.customerId}
        providerName={data.magicLink.providerName}
        returnUrl={data.magicLink.returnUrl}
      />
    );
  }

  if (data.code === 'magic_link_valid' && data.magicLink.providerName === 'salesforce') {
    return (
      <SalesforceCard
        linkId={data.magicLink.id}
        applicationId={data.magicLink.applicationId}
        customerId={data.magicLink.customerId}
        providerName={data.magicLink.providerName}
        returnUrl={data.magicLink.returnUrl}
      />
    );
  }

  return <ErrorPage />;
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
  providerName: ProviderName;
  returnUrl: string;
  scope?: string;
};

const Oauth2RedirectPage = ({
  linkId,
  applicationId,
  customerId,
  providerName,
  returnUrl,
  scope,
}: Oauth2RedirectPageProps) => {
  const router = useRouter();

  const { nextLambdaEnv, isLoading } = useNextLambdaEnv();

  useEffect(() => {
    void (async () => {
      if (!nextLambdaEnv?.API_HOST) {
        return;
      }
      let oauthUrl = `${
        nextLambdaEnv.API_HOST
      }/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
        customerId
      )}&returnUrl=${returnUrl}&providerName=${providerName}`;
      if (scope) {
        oauthUrl += `&scope=${encodeURIComponent(scope)}`;
      }

      await consumeMagicLink(linkId);
      await router.push(oauthUrl);
    })();
  }, [nextLambdaEnv?.API_HOST, router, linkId, applicationId, customerId, providerName, returnUrl]);

  if (isLoading) {
    return <Spinner />;
  }

  return null;
};

type MagicLinkFormWrapperProps = {
  providerName: ProviderName;
  children: React.ReactNode;
};

const MagicLinkFormWrapper = ({ providerName, children }: MagicLinkFormWrapperProps) => {
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Grid item xs={3}>
        <Card sx={{ padding: '4rem' }}>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={1} className="items-center w-full">
              <Typography variant="subtitle1">Connect to {getDisplayName(providerName)}</Typography>
              {providerToIcon(providerName, 35)}
            </Stack>
            {children}
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

type MagicLinkFormProps = {
  linkId: string;
  returnUrl: string;
  providerName: ProviderName;
};

const AccessKeySecretCard = ({ linkId, providerName, returnUrl }: MagicLinkFormProps) => {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState('');
  const [accessKeySecret, setAccessKeySecret] = useState('');
  return (
    <MagicLinkFormWrapper providerName={providerName}>
      <Stack className="gap-2">
        <Typography variant="subtitle1">Access Key</Typography>
        <TextField
          required={true}
          value={accessKey}
          size="small"
          label="Access Key"
          variant="outlined"
          helperText={`Enter your ${getDisplayName(providerName)} Access Key`}
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
          helperText={`Enter your ${getDisplayName(providerName)} Access Key Secret`}
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
          Authenticate
        </Button>
      </Stack>
    </MagicLinkFormWrapper>
  );
};

const ApiKeyCard = ({ linkId, providerName, returnUrl }: MagicLinkFormProps) => {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  return (
    <MagicLinkFormWrapper providerName={providerName}>
      <Stack className="gap-2">
        <Typography variant="subtitle1">API Key</Typography>
        <TextField
          required={true}
          value={apiKey}
          size="small"
          label="API Key"
          variant="outlined"
          type="password"
          helperText={`Enter your ${getDisplayName(providerName)} API Key`}
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
          Authenticate
        </Button>
      </Stack>
    </MagicLinkFormWrapper>
  );
};

const MsDynamics365Card = ({ applicationId, customerId, linkId, providerName, returnUrl }: Oauth2RedirectPageProps) => {
  const router = useRouter();
  const { addNotification } = useNotification();

  const { nextLambdaEnv, isLoading } = useNextLambdaEnv();
  const [instanceUrl, setInstanceUrl] = useState('');

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <MagicLinkFormWrapper providerName={providerName}>
      <Stack className="gap-2">
        <Typography variant="subtitle1">Instance URL</Typography>
        <TextField
          required={true}
          value={instanceUrl}
          size="small"
          label="Instance URL"
          variant="outlined"
          helperText={`Enter your Microsoft Dynamics 365 Instance URL (must start with https://)`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setInstanceUrl(event.target.value);
          }}
        />
      </Stack>
      <Stack direction="row" className="gap-2 justify-end">
        <Button
          disabled={!instanceUrl}
          variant="contained"
          onClick={async () => {
            if (!nextLambdaEnv?.API_HOST) {
              addNotification({
                message: 'Unknown error encountered. Please refresh and try again.',
                severity: 'error',
              });
              return;
            }
            if (!instanceUrl.startsWith('https://')) {
              addNotification({ message: 'Instance URL must start with https://', severity: 'error' });
              return;
            }
            const trimmedInstanceUrl = instanceUrl.replace(/\/$/, '');
            const oauthUrl = `${
              nextLambdaEnv.API_HOST
            }/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
              customerId
            )}&returnUrl=${returnUrl}&providerName=${providerName}&scope=${encodeURIComponent(
              `${trimmedInstanceUrl}/.default`
            )}`;

            await consumeMagicLink(linkId);
            await router.push(oauthUrl);
          }}
        >
          Authenticate
        </Button>
      </Stack>
    </MagicLinkFormWrapper>
  );
};

const SalesforceCard = ({ applicationId, customerId, linkId, providerName, returnUrl }: Oauth2RedirectPageProps) => {
  const router = useRouter();

  const { addNotification } = useNotification();
  const { nextLambdaEnv, isLoading } = useNextLambdaEnv();
  const [isSandbox, setIsSandbox] = useState(false);

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <MagicLinkFormWrapper providerName={providerName}>
      <Stack className="gap-2">
        <Typography variant="subtitle1">Environment</Typography>
        <Select
          name="Environment"
          onChange={(value: string) => {
            setIsSandbox(value === 'Sandbox');
          }}
          value={isSandbox ? 'Sandbox' : 'Production'}
          options={[{ value: 'Production' }, { value: 'Sandbox' }]}
        />
      </Stack>
      <Stack direction="row" className="gap-2 justify-end">
        <Button
          variant="contained"
          onClick={async () => {
            if (!nextLambdaEnv?.API_HOST) {
              addNotification({
                message: 'Unknown error encountered. Please refresh and try again.',
                severity: 'error',
              });

              return;
            }
            let oauthUrl = `${
              nextLambdaEnv.API_HOST
            }/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
              customerId
            )}&returnUrl=${returnUrl}&providerName=${providerName}`;
            if (isSandbox) {
              oauthUrl += `&loginUrl=${encodeURIComponent('https://test.salesforce.com')}`;
            }

            await consumeMagicLink(linkId);
            await router.push(oauthUrl);
          }}
        >
          Authenticate
        </Button>
      </Stack>
    </MagicLinkFormWrapper>
  );
};
