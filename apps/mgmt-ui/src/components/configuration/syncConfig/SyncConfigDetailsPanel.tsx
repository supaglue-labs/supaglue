/* eslint-disable @typescript-eslint/no-floating-promises */
import { createSyncConfig, updateSyncConfig } from '@/client';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { useProviders } from '@/hooks/useProviders';
import { toGetSyncConfigsResponse, useSyncConfigs } from '@/hooks/useSyncConfigs';
import { Autocomplete, Breadcrumbs, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { CommonModelType, CommonObjectConfig, Provider, SyncConfig, SyncConfigCreateParams } from '@supaglue/types';
import { CRM_COMMON_MODEL_TYPES } from '@supaglue/types/crm';
import { ENGAGEMENT_COMMON_MODEL_TYPES } from '@supaglue/types/engagement';
import type { ObjectSyncType } from '@supaglue/types/object_sync';
import { HUBSPOT_STANDARD_OBJECT_TYPES, SALESFORCE_OBJECTS } from '@supaglue/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ONE_HOUR_SECONDS = 60 * 60;

const isSyncPeriodSecsValid = (syncPeriodSecs: number | undefined) => {
  if (!syncPeriodSecs) {
    return false;
  }
  return syncPeriodSecs < 60 ? false : true;
};

export function SyncConfigDetailsPanel({ syncConfigId }: { syncConfigId: string }) {
  return <SyncConfigDetailsPanelImpl syncConfigId={syncConfigId} />;
}

export function NewSyncConfigPanel() {
  return <SyncConfigDetailsPanelImpl />;
}

type SyncConfigDetailsPanelImplProps = {
  syncConfigId?: string;
};

function SyncConfigDetailsPanelImpl({ syncConfigId }: SyncConfigDetailsPanelImplProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();
  const { syncConfigs = [], isLoading, mutate } = useSyncConfigs();
  const { providers = [], isLoading: isLoadingProviders } = useProviders();
  const { destinations, isLoading: isLoadingDestinations } = useDestinations();
  const [syncPeriodSecs, setSyncPeriodSecs] = useState<number | undefined>();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [providerId, setProviderId] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [strategy, setStrategy] = useState<ObjectSyncType>('full then incremental');
  const [commonObjects, setCommonObjects] = useState<CommonModelType[]>([]);
  const [standardObjects, setStandardObjects] = useState<string[]>([]);
  const [customObjects, setCustomObjects] = useState<string[]>([]);
  const router = useRouter();

  const isFormValid = destinationId && providerId && isSyncPeriodSecsValid(syncPeriodSecs);

  const syncConfig = syncConfigs.find((s) => s.id === syncConfigId);

  useEffect(() => {
    setDestinationId(syncConfig?.destinationId ?? undefined);
    setProviderId(syncConfig?.providerId ?? undefined);
    setSyncPeriodSecs(
      syncConfig?.config?.defaultConfig?.periodMs
        ? syncConfig?.config?.defaultConfig?.periodMs / 1000
        : ONE_HOUR_SECONDS
    );
    setStrategy(syncConfig?.config?.defaultConfig?.strategy ?? 'full then incremental');
    setCommonObjects(syncConfig?.config?.commonObjects?.map((o) => o.object) ?? []);
    setStandardObjects(syncConfig?.config?.standardObjects?.map((o) => o.object) ?? []);
    setCustomObjects(syncConfig?.config?.customObjects?.map((o) => o.object) ?? []);
  }, [syncConfig?.id]);

  if (isLoading || isLoadingProviders || isLoadingDestinations) {
    return <Spinner />;
  }

  const formTitle = syncConfig ? 'Edit Sync Config' : 'New Sync Config';
  const provider = providers?.find((p) => p.id === providerId);

  const createOrUpdateSyncConfig = async (): Promise<SyncConfig | undefined> => {
    if (!destinationId || !providerId) {
      addNotification({ message: 'Destination and Provider must be selected', severity: 'error' });
      return;
    }
    if (isLoading) {
      addNotification({ message: 'Cannot save while loading', severity: 'error' });
      return;
    }
    if (!syncConfig && syncConfigs.find((s) => s.providerId === providerId)) {
      addNotification({ message: 'Sync config already exists for provider', severity: 'error' });
      return;
    }

    if (syncConfig) {
      const newSyncConfig: SyncConfig = {
        ...syncConfig,
        destinationId,
        providerId,
        config: {
          ...syncConfig.config,
          defaultConfig: {
            ...syncConfig.config.defaultConfig,
            periodMs: syncPeriodSecs ? syncPeriodSecs * 1000 : ONE_HOUR_SECONDS,
            strategy,
          },
          commonObjects: commonObjects.map((object) => ({ object } as CommonObjectConfig)),
          standardObjects: standardObjects.map((object) => ({ object })),
          customObjects: customObjects.map((object) => ({ object })),
        },
      };
      const response = await updateSyncConfig(activeApplicationId, newSyncConfig);
      if (!response.ok) {
        addNotification({ message: response.errorMessage, severity: 'error' });
        return;
      }
      return response.data;
    }

    const provider = providers?.find((p) => p.id === providerId);
    if (!provider) {
      throw new Error('Could not get provider');
    }
    // create path
    const newSyncConfig: SyncConfigCreateParams = {
      applicationId: activeApplicationId,
      destinationId,
      providerId,
      config: {
        defaultConfig: {
          periodMs: syncPeriodSecs ? syncPeriodSecs * 1000 : ONE_HOUR_SECONDS,
          strategy,
        },
        commonObjects: commonObjects.map((object) => ({ object } as CommonObjectConfig)),
        standardObjects: standardObjects.map((object) => ({ object })),
        customObjects: customObjects.map((object) => ({ object })),
      },
    };
    const response = await createSyncConfig(activeApplicationId, newSyncConfig);
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    return response.data;
  };

  const selectedProvider = providers.find((p) => p.id === providerId);
  const selectedDestination = destinations?.find((d) => d.id === destinationId);
  const supportsStandardDestinations = ['postgres'];
  const supportsCustomDestinations = ['postgres'];
  const supportsStandardObjects = ['hubspot', 'salesforce', 'ms_dynamics_365_sales'];
  const supportsCustomObjects = ['hubspot', 'salesforce'];

  const standardObjectsOptions = getStandardObjectOptions(selectedProvider);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs>
        <Link color="inherit" href={`/applications/${activeApplicationId}`}>
          Home
        </Link>
        <Link color="inherit" href={`/applications/${activeApplicationId}/configuration/sync_configs`}>
          <Typography color="text.primary">Sync Configs</Typography>
        </Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Card>
        <Stack direction="column" className="gap-2" sx={{ padding: '2rem' }}>
          <Stack direction="row" className="items-center justify-between w-full">
            <Stack direction="column">
              <Typography variant="subtitle1">{formTitle}</Typography>
            </Stack>
          </Stack>
          <Stack className="gap-2">
            <Typography variant="subtitle1">Provider</Typography>
            <Select
              name="Provider"
              disabled={isLoadingProviders || !!syncConfig}
              onChange={(value) => {
                if (value === providerId) {
                  return;
                }
                const provider = providers.find((p) => p.id === value);
                setProviderId(value);
                setCommonObjects(
                  provider?.category === 'crm' ? [...CRM_COMMON_MODEL_TYPES] : [...ENGAGEMENT_COMMON_MODEL_TYPES]
                );
                setStandardObjects([]);
                setCustomObjects([]);
              }}
              value={providerId ?? ''}
              options={providers?.map(({ id, name }) => ({ value: id, displayValue: name })) ?? []}
            />
          </Stack>
          <Stack className="gap-2">
            <Typography variant="subtitle1">Destination</Typography>
            <Select
              name="Destination"
              disabled={isLoadingDestinations || !!syncConfig}
              onChange={setDestinationId}
              value={destinationId ?? ''}
              options={destinations?.map(({ id, name }) => ({ value: id, displayValue: name })) ?? []}
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
              helperText="Value needs to be 60 seconds or greater."
              error={syncPeriodSecs === undefined || !isSyncPeriodSecsValid(syncPeriodSecs)}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                let value: number | undefined = parseInt(event.target.value, 10);
                if (Number.isNaN(value)) {
                  value = undefined;
                }
                setSyncPeriodSecs(value);
              }}
            />
          </Stack>
          {provider && (
            <>
              <Stack className="gap-2">
                <Typography variant="subtitle1">Common objects</Typography>
                <Autocomplete
                  size="small"
                  key={providerId}
                  multiple
                  id="common-objects"
                  options={CRM_COMMON_MODEL_TYPES}
                  defaultValue={commonObjects}
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Common objects"
                      helperText={`Objects that Supaglue has unified across all ${selectedProvider?.category} providers.`}
                    />
                  )}
                  onChange={(event: any, value: string[]) => {
                    setCommonObjects(value as CommonModelType[]);
                  }}
                />
              </Stack>
              <Stack className="gap-2">
                <Typography variant="subtitle1">Standard objects</Typography>
                <Autocomplete
                  disabled={
                    !supportsStandardObjects.includes(String(selectedProvider?.name)) ||
                    !supportsStandardDestinations.includes(String(selectedDestination?.type))
                  }
                  size="small"
                  key={providerId}
                  multiple
                  id="standard-objects"
                  options={standardObjectsOptions}
                  defaultValue={standardObjects}
                  autoSelect
                  freeSolo
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Standard objects"
                      helperText={`Standard objects in ${selectedProvider?.name}. (Note: names are case-sensitive. Use "enter" to add multiple objects.)`}
                    />
                  )}
                  onChange={(event: any, value: string[]) => {
                    setStandardObjects(value);
                  }}
                />
              </Stack>
              <Stack className="gap-2">
                <Typography variant="subtitle1">Custom objects</Typography>
                <Autocomplete
                  disabled={
                    !supportsCustomObjects.includes(String(selectedProvider?.name)) ||
                    !supportsCustomDestinations.includes(String(selectedDestination?.type))
                  }
                  size="small"
                  key={providerId}
                  multiple
                  id="custom-objects"
                  options={[]}
                  defaultValue={customObjects}
                  autoSelect
                  freeSolo
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Custom objects"
                      helperText={`Custom objects in ${selectedProvider?.name}. (Note: names are case-sensitive. Use "enter" to add multiple objects.)`}
                    />
                  )}
                  onChange={(event: any, value: string[]) => {
                    setCustomObjects(value);
                  }}
                />
              </Stack>
            </>
          )}
          <Stack direction="row" className="gap-2 justify-between">
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
                const newSyncConfig = await createOrUpdateSyncConfig();
                if (newSyncConfig) {
                  const latestSyncConfigs = toGetSyncConfigsResponse([
                    ...syncConfigs.filter((syncConfig) => syncConfig.id !== newSyncConfig.id),
                    newSyncConfig,
                  ]);
                  addNotification({ message: 'Successfully updated Sync Config', severity: 'success' });
                  await mutate(latestSyncConfigs, {
                    optimisticData: latestSyncConfigs,
                    revalidate: false,
                    populateCache: false,
                  });
                }
                setIsSaving(false);
                router.back();
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}

const getStandardObjectOptions = (provider: Provider | undefined): string[] => {
  switch (provider?.name) {
    case 'hubspot': {
      return HUBSPOT_STANDARD_OBJECT_TYPES as unknown as string[];
    }
    case 'salesforce': {
      return SALESFORCE_OBJECTS as unknown as string[];
    }
    default:
      return [];
  }
};
