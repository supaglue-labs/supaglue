/* eslint-disable @typescript-eslint/no-floating-promises */
import { sendRequest } from '@/sendRequests';
import providerToIcon from '@/utils/providerToIcon';
import { Box, Button, Stack, Switch, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { Integration, IntegrationCardInfo } from './VerticalTabs';

export type IntegrationDetailTabPanelProps = {
  integration: Integration;
  integrationCardInfo: IntegrationCardInfo;
  status: string;
};

export default function IntegrationDetailTabPanel(props: IntegrationDetailTabPanelProps) {
  const { integration, integrationCardInfo } = props;
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [oauthScopes, setOauthScopes] = useState('');

  const { trigger } = useSWRMutation('/mgmt/v1/integrations', sendRequest);

  useEffect(() => {
    setClientId(integration?.config?.oauth?.credentials?.oauthClientId);
    setClientSecret(integration?.config?.oauth?.credentials?.oauthClientSecret);
    setOauthScopes(integration?.config?.oauth?.oauthScopes?.join(','));
  }, [integration]);

  return (
    <Stack direction="column" className="gap-4">
      <Stack direction="row" className="items-center justify-between w-full">
        <Stack direction="row">
          {providerToIcon(integrationCardInfo.providerName)}
          <Typography variant="subtitle1">{integrationCardInfo.name}</Typography>
        </Stack>
        <Box>
          <Switch></Switch>
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
      <Stack direction="row" className="gap-2">
        <Button variant="outlined">Cancel</Button>{' '}
        <Button
          variant="contained"
          onClick={() => {
            trigger({
              ...integration,
              config: {
                ...integration?.config,
                oauth: {
                  credentials: {
                    oauthClientId: clientId,
                    oauthClientSecret: clientSecret,
                  },
                  oauthScopes: oauthScopes.split(','),
                  ...integration?.config?.oauth,
                },
              },
            });
          }}
        >
          Save
        </Button>
      </Stack>
    </Stack>
  );
}
