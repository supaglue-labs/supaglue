/* eslint-disable @typescript-eslint/no-floating-promises */
import { updateRemoteIntegration } from '@/client';
import { useApplication } from '@/hooks/useApplication';
import { useIntegrations } from '@/hooks/useIntegrations';
import providerToIcon from '@/utils/providerToIcon';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
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
  const [syncPeriodSecs, setSyncPeriodSecs] = useState<number | undefined>();
  const router = useRouter();

  const { integrations: existingIntegrations = [], mutate } = useIntegrations();

  useEffect(() => {
    setClientId(integration?.config?.oauth?.credentials?.oauthClientId);
    setClientSecret(integration?.config?.oauth?.credentials?.oauthClientSecret);
    setOauthScopes(integration?.config?.oauth?.oauthScopes?.join(','));
    setSyncPeriodSecs(integration?.config.sync?.periodMs / 1000);
  }, [integration]);

  return (
    <Card>
      <Stack direction="column" className="gap-4" sx={{ padding: '2rem' }}>
        <Stack direction="row" className="items-center justify-between w-full">
          <Stack direction="row" className="items-center justify-center gap-2">
            {providerToIcon(integrationCardInfo.providerName, 35)}
            <Stack direction="column">
              <Typography variant="subtitle1">{integrationCardInfo.name}</Typography>
              <Typography fontSize={12}>{integrationCardInfo.category.toUpperCase()}</Typography>
            </Stack>
          </Stack>
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

        <Stack className="gap-2">
          <Typography variant="subtitle1">Sync frequency</Typography>
          <TextField
            value={syncPeriodSecs}
            size="small"
            label="Sync every (in seconds)"
            variant="outlined"
            type="number"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSyncPeriodSecs(parseInt(event.target.value, 3600));
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
                      periodMs: syncPeriodSecs ? syncPeriodSecs * 1000 : 3600,
                    },
                  },
                };
                const updatedIntegrations = existingIntegrations.map((ei: Integration) =>
                  ei.id === newIntegration.id ? newIntegration : ei
                );

                updateRemoteIntegration(applicationId, newIntegration);
                mutate(updatedIntegrations, false);
                router.push(`/configuration/integrations/${newIntegration.category}`);
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
