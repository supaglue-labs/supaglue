/* eslint-disable @typescript-eslint/no-floating-promises */
import { updateRemoteIntegration } from '@/client';
import { useApplication } from '@/hooks/useApplication';
import { useIntegrations } from '@/hooks/useIntegrations';
import providerToIcon from '@/utils/providerToIcon';
import { Box, Button, Stack, Switch, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Integration, IntegrationCardInfo } from './VerticalTabs';

export type IntegrationDetailTabPanelProps = {
  integration: Integration;
  integrationCardInfo: IntegrationCardInfo;
  status: string;
};

export default function IntegrationDetailTabPanel(props: IntegrationDetailTabPanelProps) {
  const { applicationId } = useApplication();
  const { integration, integrationCardInfo } = props;
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [oauthScopes, setOauthScopes] = useState('');
  const router = useRouter();

  const { integrations: existingIntegrations = [], mutate } = useIntegrations();

  useEffect(() => {
    setClientId(integration?.config?.oauth?.credentials?.oauthClientId);
    setClientSecret(integration?.config?.oauth?.credentials?.oauthClientSecret);
    setOauthScopes(integration?.config?.oauth?.oauthScopes?.join(','));
  }, [integration]);

  return (
    <Stack direction="column" className="gap-4">
      <Stack direction="row" className="items-center justify-between w-full">
        <Stack direction="row" className="items-center justify-center gap-2">
          {providerToIcon(integrationCardInfo.providerName, 35)}
          <Stack direction="column">
            <Typography variant="subtitle1">{integrationCardInfo.name}</Typography>
            <Typography fontSize={12}>
              {integrationCardInfo.status === 'auth-only'
                ? integrationCardInfo.status
                : integrationCardInfo.category.toUpperCase()}
            </Typography>
          </Stack>
        </Stack>
        <Box>
          <Switch disabled checked={integration?.isEnabled}></Switch>
        </Box>
      </Stack>

      <Stack className="gap-2">
        <Typography variant="subtitle1">Credentials</Typography>
        <TextField
          value={clientId}
          size="small"
          label="Client ID"
          variant="outlined"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setClientId(event.target.value);
          }}
        />
        <TextField
          value={clientSecret}
          size="small"
          label="Client Secret"
          variant="outlined"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setClientSecret(event.target.value);
          }}
        />
      </Stack>

      <Stack className="gap-2">
        <Typography variant="subtitle1">Scopes</Typography>
        <TextField
          value={oauthScopes}
          size="small"
          label="OAuth scopes (comma separated)"
          variant="outlined"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setOauthScopes(event.target.value);
          }}
        />
      </Stack>
      <Stack direction="row" className="gap-2 justify-between">
        <Stack direction="row" className="gap-2">
          <Button
            variant="outlined"
            onClick={() => {
              router.back();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const newIntegration = {
                ...integration,
                config: {
                  providerAppId: '', // TODO: add input field for this
                  ...integration?.config,
                  oauth: {
                    ...integration?.config?.oauth,
                    credentials: {
                      oauthClientId: clientId,
                      oauthClientSecret: clientSecret,
                    },
                    oauthScopes: oauthScopes.split(','),
                  },
                  sync: {
                    periodMs: 60 * 60 * 1000, // TODO: add input field for this
                  },
                },
              };
              const updatedIntegrations = existingIntegrations.map((ei: Integration) =>
                ei.id === newIntegration.id ? newIntegration : ei
              );

              updateRemoteIntegration(applicationId, newIntegration);
              mutate(updatedIntegrations, false);
            }}
          >
            Save
          </Button>
        </Stack>
        <Stack direction="row" className="gap-2">
          <Button disabled variant="text" color="error">
            Delete
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
