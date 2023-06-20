/* eslint-disable @typescript-eslint/no-floating-promises */
import { createRemoteIntegration, updateRemoteIntegration } from '@/client';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { useIntegrations } from '@/hooks/useIntegrations';
import providerToIcon from '@/utils/providerToIcon';
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Card from '@mui/material/Card';
import { Integration, ProviderCategory, ProviderName } from '@supaglue/types';
import { CRMProviderName } from '@supaglue/types/crm';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { integrationCardsInfo } from './IntegrationTabPanelContainer';

const ONE_HOUR_SECONDS = 60 * 60;

export type IntegrationDetailsPanelProps = {
  category: ProviderCategory;
  providerName: ProviderName;
  isLoading: boolean;
};

const isSyncPeriodSecsValid = (syncPeriodSecs: number) => {
  return syncPeriodSecs < 60 ? false : true;
};

export default function IntegrationDetailsPanel({ providerName, category, isLoading }: IntegrationDetailsPanelProps) {
  const shouldAllowManagedOauth = ['salesforce', 'hubspot'].includes(providerName);
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();
  const [friendlyIntegrationId, setFriendlyIntegrationId] = useState<string>('--');
  const { destinations, isLoading: isLoadingDestinations } = useDestinations();
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [oauthScopes, setOauthScopes] = useState<string>('');
  const [syncPeriodSecs, setSyncPeriodSecs] = useState<number | undefined>();
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [useManagedOauth, setUseManagedOauth] = useState<boolean>(true);
  const router = useRouter();

  const { integrations: existingIntegrations = [], mutate } = useIntegrations();

  const integration = existingIntegrations.find(
    (existingIntegration) => existingIntegration.providerName === providerName
  );

  const integrationCardInfo = integrationCardsInfo.find(
    (integrationCardInfo) => integrationCardInfo.providerName === providerName
  );

  useEffect(() => {
    setFriendlyIntegrationId(integration?.id ?? '--');
    setClientId(integration?.config?.oauth?.credentials?.oauthClientId ?? '');
    setClientSecret(integration?.config?.oauth?.credentials?.oauthClientSecret ?? '');
    setOauthScopes(integration?.config?.oauth?.oauthScopes?.join(',') ?? '');
    setSyncPeriodSecs(
      integration?.config?.sync?.periodMs ? integration?.config?.sync?.periodMs / 1000 : ONE_HOUR_SECONDS
    );
    setDestinationId(integration?.destinationId ?? undefined);
    setUseManagedOauth(
      integration?.id
        ? Boolean(integration?.config?.useManagedOauth) && shouldAllowManagedOauth
        : shouldAllowManagedOauth
    );
  }, [integration?.id]);

  const createOrUpdateIntegration = async (): Promise<Integration> => {
    if (integration) {
      const newIntegration: Integration = {
        ...integration,
        destinationId: destinationId ?? null,
        config: {
          ...integration?.config,
          providerAppId: '', // TODO: add input field for this
          oauth: {
            ...integration?.config?.oauth,
            credentials: {
              oauthClientId: clientId,
              oauthClientSecret: clientSecret,
            },
            oauthScopes: oauthScopes.split(','),
          },
          sync: {
            ...integration?.config?.sync,
            periodMs: syncPeriodSecs ? syncPeriodSecs * 1000 : ONE_HOUR_SECONDS,
          },
        },
      };
      return await updateRemoteIntegration(activeApplicationId, newIntegration);
    }
    return await createRemoteIntegration(activeApplicationId, {
      applicationId: activeApplicationId,
      destinationId: destinationId ?? null,
      authType: 'oauth2',
      // TODO: Support creating engagement integrations
      category: category as 'crm',
      providerName: providerName as CRMProviderName,
      config: {
        providerAppId: '', // TODO: add input field for this
        useManagedOauth,
        oauth: {
          credentials: {
            oauthClientId: clientId,
            oauthClientSecret: clientSecret,
          },
          oauthScopes: oauthScopes.split(','),
        },
        sync: {
          periodMs: syncPeriodSecs ? syncPeriodSecs * 1000 : ONE_HOUR_SECONDS,
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
      <CardHeader
        avatar={providerToIcon(integrationCardInfo.providerName, 35)}
        className="gap-4 items-center justify-between w-full"
        title={integrationCardInfo.name}
        subheader={integrationCardInfo.category.toUpperCase()}
        sx={{ paddingX: '2rem' }}
      ></CardHeader>
      <CardContent className="gap-4" sx={{ padding: '2rem' }}>
        <Stack className="gap-2">
          <TextField value={friendlyIntegrationId} size="small" label="Integration ID" variant="outlined" disabled />
        </Stack>

        <Stack className="pt-6">
          <Typography variant="subtitle1">Provider Configuration</Typography>
          <Stack className="gap-4 pt-4">
            <FormGroup>
              {shouldAllowManagedOauth && (
                <Box className="pb-4">
                  <FormControlLabel
                    control={
                      <Switch
                        disabled={integration?.id ? true : false}
                        checked={useManagedOauth}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          setUseManagedOauth(event.target.checked);
                        }}
                      />
                    }
                    label="Use Supaglue's OAuth2 app"
                  />
                  <FormHelperText sx={{ marginY: 0, marginLeft: '14px' }}>
                    This cannot be changed once saved
                  </FormHelperText>
                </Box>
              )}
              <Stack className="gap-2">
                <TextField
                  disabled={useManagedOauth}
                  value={clientId}
                  size="small"
                  label="OAuth2 client ID"
                  variant="outlined"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setClientId(event.target.value);
                  }}
                />
                <TextField
                  disabled={useManagedOauth}
                  value={clientSecret}
                  size="small"
                  label="OAuth2 client secret"
                  variant="outlined"
                  type="password"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setClientSecret(event.target.value);
                  }}
                />
                <TextField
                  disabled={useManagedOauth || providerName === 'ms_dynamics_365_sales'}
                  value={oauthScopes}
                  size="small"
                  label="OAuth2 scopes"
                  variant="outlined"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setOauthScopes(event.target.value);
                  }}
                  helperText="Comma separated values (without spaces)"
                />
              </Stack>
            </FormGroup>
          </Stack>
        </Stack>

        <Stack className="pt-6">
          <Typography variant="subtitle1">Destination Configuration</Typography>
          <Stack className="gap-2 pt-4">
            <Select
              name="Destination"
              disabled={isLoadingDestinations || !!integration?.destinationId}
              onChange={setDestinationId}
              value={destinationId ?? ''}
              options={destinations?.map(({ id, name }) => ({ value: id, displayValue: name })) ?? []}
              unselect
            />
          </Stack>
        </Stack>

        <Stack className="pt-6">
          <Typography variant="subtitle1">Sync Configuration</Typography>

          <Stack className="gap-2 pt-4">
            <TextField
              value={syncPeriodSecs}
              size="small"
              label="Frequency (every inputed seconds)"
              variant="outlined"
              type="number"
              helperText="Value needs to be 60 seconds or greater."
              error={syncPeriodSecs === undefined || !isSyncPeriodSecsValid(syncPeriodSecs)}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                let value: number | undefined = parseInt(event.target.value, 10);
                if (Number.isNaN(value)) {
                  value = undefined;
                }
                setSyncPeriodSecs(value);
                setIsFormValid(value !== undefined && isSyncPeriodSecsValid(value));
              }}
            />
          </Stack>
        </Stack>

        <Stack direction="row" className="pt-6 gap-2 justify-between">
          <Button
            variant="outlined"
            disabled={isSaving}
            onClick={() => {
              router.back();
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            disabled={!isFormValid || isSaving || isLoading}
            onClick={async () => {
              setIsSaving(true);
              const newIntegration = await createOrUpdateIntegration();
              const latestIntegrations = [
                ...existingIntegrations.filter((integration) => integration.id !== newIntegration.id),
                newIntegration,
              ];
              addNotification({ message: 'Successfully updated integration', severity: 'success' });
              await mutate(latestIntegrations, {
                optimisticData: latestIntegrations,
                revalidate: false,
                populateCache: false,
              });
              setIsSaving(false);
            }}
          >
            Save
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
