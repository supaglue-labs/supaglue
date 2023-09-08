import { consumeMagicLink } from '@/client';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useMagicLinkData } from '@/hooks/useMagicLinkData';
import { API_HOST, IS_CLOUD } from '@/pages/api';
import { getDisplayName } from '@/utils/provider';
import providerToIcon from '@/utils/providerToIcon';
import { Box, Button, Card, Grid, Stack, TextField, Typography } from '@mui/material';
import type { ProviderName } from '@supaglue/types';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type PublicEnvProps = {
  API_HOST: string;
  IS_CLOUD: boolean;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { session: null, signedIn: false, API_HOST, IS_CLOUD },
  };
};

export default function Home(props: PublicEnvProps) {
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

  if (data.code !== 'magic_link_valid') {
    return <ErrorPage />;
  }

  switch (data.magicLink.providerName) {
    case 'apollo':
    case 'clearbit':
    case '6sense':
      return (
        <ApiKeyCard
          returnUrl={data.magicLink.returnUrl}
          linkId={data.magicLink.id}
          providerName={data.magicLink.providerName}
        />
      );
    case 'gong':
      return (
        <GongCard
          linkId={data.magicLink.id}
          applicationId={data.magicLink.applicationId}
          customerId={data.magicLink.customerId}
          providerName={data.magicLink.providerName}
          returnUrl={data.magicLink.returnUrl}
          {...props}
        />
      );
    case 'ms_dynamics_365_sales':
      return (
        <MsDynamics365Card
          linkId={data.magicLink.id}
          applicationId={data.magicLink.applicationId}
          customerId={data.magicLink.customerId}
          providerName={data.magicLink.providerName}
          returnUrl={data.magicLink.returnUrl}
          {...props}
        />
      );
    case 'salesforce':
      return (
        <SalesforceCard
          linkId={data.magicLink.id}
          applicationId={data.magicLink.applicationId}
          customerId={data.magicLink.customerId}
          providerName={data.magicLink.providerName}
          returnUrl={data.magicLink.returnUrl}
          {...props}
        />
      );
    case 'marketo':
      return (
        <MarketoCard
          linkId={data.magicLink.id}
          providerName={data.magicLink.providerName}
          returnUrl={data.magicLink.returnUrl}
          {...props}
        />
      );
    case 'salesforce_marketing_cloud_account_engagement':
      return (
        <SalesforceMarketingCloudAccountEngagementCard
          linkId={data.magicLink.id}
          applicationId={data.magicLink.applicationId}
          customerId={data.magicLink.customerId}
          providerName={data.magicLink.providerName}
          returnUrl={data.magicLink.returnUrl}
          {...props}
        />
      );
    default:
      return (
        <Oauth2RedirectPage
          linkId={data.magicLink.id}
          applicationId={data.magicLink.applicationId}
          customerId={data.magicLink.customerId}
          providerName={data.magicLink.providerName}
          returnUrl={data.magicLink.returnUrl}
          {...props}
        />
      );
  }
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
  API_HOST,
}: Oauth2RedirectPageProps & PublicEnvProps) => {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      if (!API_HOST) {
        return;
      }
      let oauthUrl = `${API_HOST}/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
        customerId
      )}&returnUrl=${returnUrl}&providerName=${providerName}`;
      if (scope) {
        oauthUrl += `&scope=${encodeURIComponent(scope)}`;
      }

      await consumeMagicLink(linkId);
      await router.push(oauthUrl);
    })();
  }, [API_HOST, router, linkId, applicationId, customerId, providerName, returnUrl]);

  return null;
};

type MagicLinkFormWrapperProps = {
  providerName: ProviderName;
  children: React.ReactNode;
};

const MagicLinkFormWrapper = ({ providerName, children }: MagicLinkFormWrapperProps) => {
  return (
    <Grid
      sx={{ backgroundColor: 'gray' }}
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
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

const GongCard = ({
  linkId,
  applicationId,
  customerId,
  providerName,
  returnUrl,
  API_HOST,
}: Oauth2RedirectPageProps & PublicEnvProps) => {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [authType, setAuthType] = useState<'oauth2' | 'access_key_secret'>('oauth2');
  const [accessKey, setAccessKey] = useState('');
  const [accessKeySecret, setAccessKeySecret] = useState('');

  return (
    <MagicLinkFormWrapper providerName={providerName}>
      <Stack className="gap-2">
        <Typography variant="subtitle1">Authentication</Typography>
        <Select
          name="Authentication"
          onChange={(value) => {
            setAuthType(value as 'oauth2' | 'access_key_secret');
          }}
          value={authType}
          options={[
            { value: 'oauth2', displayValue: 'OAuth' },
            { value: 'access_key_secret', displayValue: 'Access Key and Secret' },
          ]}
        />
      </Stack>

      {authType === 'access_key_secret' && (
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
      )}
      <Stack direction="row" className="gap-2 justify-end">
        <Button
          disabled={authType === 'access_key_secret' && (!accessKey || !accessKeySecret)}
          variant="contained"
          onClick={async () => {
            if (authType === 'oauth2') {
              if (!API_HOST) {
                addNotification({
                  message: 'Unknown error encountered. Please refresh and try again.',
                  severity: 'error',
                });
                return;
              }
              const oauthUrl = `${API_HOST}/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
                customerId
              )}&returnUrl=${returnUrl}&providerName=${providerName}`;
              await consumeMagicLink(linkId);
              await router.push(oauthUrl);
            } else {
              await consumeMagicLink(linkId, { type: authType, accessKey, accessKeySecret });
              await router.push(returnUrl);
            }
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

const MsDynamics365Card = ({
  applicationId,
  customerId,
  linkId,
  providerName,
  returnUrl,
  API_HOST,
}: Oauth2RedirectPageProps & PublicEnvProps) => {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [instanceUrl, setInstanceUrl] = useState('');

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
            if (!API_HOST) {
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
            const oauthUrl = `${API_HOST}/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
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

const SalesforceCard = ({
  applicationId,
  customerId,
  linkId,
  providerName,
  returnUrl,
  API_HOST,
}: Oauth2RedirectPageProps & PublicEnvProps) => {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isSandbox, setIsSandbox] = useState(false);

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
            if (!API_HOST) {
              addNotification({
                message: 'Unknown error encountered. Please refresh and try again.',
                severity: 'error',
              });
              return;
            }
            let oauthUrl = `${API_HOST}/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
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

const MarketoCard = ({ linkId, providerName, returnUrl }: MagicLinkFormProps) => {
  const router = useRouter();
  const [instanceUrl, setInstanceUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  return (
    <MagicLinkFormWrapper providerName={providerName}>
      <Stack className="gap-2">
        <Typography variant="subtitle1">REST API Endpoint</Typography>
        <TextField
          required={true}
          value={instanceUrl}
          size="small"
          label="REST API Endpoint"
          variant="outlined"
          helperText={`Enter your Marketo REST API Endpoint`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            // the UI in marketo that shows the API endpoint appends `/rest` to it, so remove that.
            setInstanceUrl(event.target.value.trim().replace(/\/rest$/, '/'));
          }}
        />
      </Stack>

      <Stack className="gap-2">
        <Typography variant="subtitle1">Client ID</Typography>
        <TextField
          required={true}
          value={clientId}
          size="small"
          label="Client ID"
          variant="outlined"
          type="password"
          helperText={`Enter your Marketo Client ID`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setClientId(event.target.value.trim());
          }}
        />
      </Stack>

      <Stack className="gap-2">
        <Typography variant="subtitle1">Client Secret</Typography>
        <TextField
          required={true}
          value={clientSecret}
          size="small"
          label="Client Secret"
          variant="outlined"
          type="password"
          helperText={`Enter your Marketo Client Secret`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setClientSecret(event.target.value.trim());
          }}
        />
      </Stack>

      <Stack direction="row" className="gap-2 justify-end">
        <Button
          disabled={!clientId || !clientSecret || !instanceUrl}
          variant="contained"
          onClick={async () => {
            await consumeMagicLink(linkId, {
              type: 'marketo_oauth2',
              instanceUrl,
              clientId,
              clientSecret,
            });
            await router.push(returnUrl);
          }}
        >
          Authenticate
        </Button>
      </Stack>
    </MagicLinkFormWrapper>
  );
};

const SalesforceMarketingCloudAccountEngagementCard = ({
  applicationId,
  customerId,
  linkId,
  providerName,
  returnUrl,
  API_HOST,
}: Oauth2RedirectPageProps & PublicEnvProps) => {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [businessUnitId, setBusinessUnitId] = useState('');

  return (
    <MagicLinkFormWrapper providerName={providerName}>
      <Stack className="gap-2">
        <Typography variant="subtitle1">Business Unit ID</Typography>
        <TextField
          required={true}
          value={businessUnitId}
          size="small"
          label="Business Unit ID"
          variant="outlined"
          helperText={`Enter your Salesforce Marketing Cloud Account Engagement Business Unit ID`}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setBusinessUnitId(event.target.value.trim());
          }}
        />
      </Stack>
      <Stack direction="row" className="gap-2 justify-end">
        <Button
          variant="contained"
          disabled={!businessUnitId}
          onClick={async () => {
            if (!API_HOST) {
              addNotification({
                message: 'Unknown error encountered. Please refresh and try again.',
                severity: 'error',
              });
              return;
            }
            const oauthUrl = `${API_HOST}/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
              customerId
            )}&returnUrl=${returnUrl}&providerName=${providerName}&businessUnitId=${businessUnitId}`;

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
