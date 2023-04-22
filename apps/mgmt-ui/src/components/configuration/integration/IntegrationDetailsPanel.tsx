/* eslint-disable @typescript-eslint/no-floating-promises */
import { createRemoteIntegration, updateRemoteIntegration } from '@/client';
import Spinner from '@/components/Spinner';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useIntegrations } from '@/hooks/useIntegrations';
import providerToIcon from '@/utils/providerToIcon';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { Integration, IntegrationCategory } from '@supaglue/types';
import { CRMProviderName } from '@supaglue/types/crm';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { integrationCardsInfo } from './IntegrationTabPanelContainer';

export type IntegrationDetailsPanelProps = {
  category: IntegrationCategory;
  providerName: CRMProviderName;
  isLoading: boolean;
};

export default function IntegrationDetailsPanel({ providerName, category, isLoading }: IntegrationDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [oauthScopes, setOauthScopes] = useState<string>('');
  const [syncPeriodSecs, setSyncPeriodSecs] = useState<number | undefined>();
  const router = useRouter();

  const { integrations: existingIntegrations = [], mutate } = useIntegrations();

  const integration = existingIntegrations.find(
    (existingIntegration) => existingIntegration.providerName === providerName
  );

  const integrationCardInfo = integrationCardsInfo.find(
    (integrationCardInfo) => integrationCardInfo.providerName === providerName
  );

  useEffect(() => {
    if (!clientId) {
      setClientId(integration?.config?.oauth?.credentials?.oauthClientId ?? '');
    }
    if (!clientSecret) {
      setClientSecret(integration?.config?.oauth?.credentials?.oauthClientSecret ?? '');
    }
    if (!oauthScopes) {
      setOauthScopes(integration?.config?.oauth?.oauthScopes?.join(',') ?? '');
    }
    if (!syncPeriodSecs) {
      setSyncPeriodSecs(integration?.config?.sync?.periodMs ? integration?.config?.sync?.periodMs / 1000 : 3600);
    }
  }, [integration?.id]);

  const createOrUpdateIntegration = async (): Promise<Integration> => {
    if (integration) {
      const newIntegration: Integration = {
        ...integration,
        config: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
      return await updateRemoteIntegration(activeApplicationId, newIntegration);
    }
    return await createRemoteIntegration(activeApplicationId, {
      applicationId: activeApplicationId,
      authType: 'oauth2',
      category: category as 'crm', // TODO: allow engagement too
      providerName,
      config: {
        providerAppId: '', // TODO: add input field for this
        oauth: {
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
    });
  };

  if (!integrationCardInfo) {
    return null;
  }

  if (isLoading) {
    return <Spinner />;
  }

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
            type="password"
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
              setSyncPeriodSecs(parseInt(event.target.value, 10));
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
              onClick={async () => {
                const newIntegration = await createOrUpdateIntegration();
                mutate([...existingIntegrations, newIntegration], false);
                router.push(
                  `/applications/${activeApplicationId}/configuration/integrations/${newIntegration.category}`
                );
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
