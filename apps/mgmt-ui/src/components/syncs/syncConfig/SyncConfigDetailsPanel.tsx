/* eslint-disable @typescript-eslint/no-floating-promises */
import { createSyncConfig, updateSyncConfig } from '@/client';
import { ConfirmationModal } from '@/components/modals';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { useEntities } from '@/hooks/useEntities';
import { useLekkoConfigs } from '@/hooks/useLekkoConfigs';
import { useProviders } from '@/hooks/useProviders';
import { toGetSyncConfigsResponse, useSyncConfigs } from '@/hooks/useSyncConfigs';
import type { SupaglueProps } from '@/pages/applications/[applicationId]';
import { getDestinationName } from '@/utils/destination';
import { getStandardObjectOptions } from '@/utils/provider';
import { entitiesEnabled } from '@/utils/schema';
import { Autocomplete, Breadcrumbs, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import type {
  CommonObjectType,
  ProviderCategory,
  ProviderName,
  SyncConfigCreateParams,
  SyncConfigData,
  SyncConfigDTO,
} from '@supaglue/types';
import { CRM_COMMON_OBJECT_TYPES } from '@supaglue/types/crm';
import { ENGAGEMENT_SYNCABLE_COMMON_OBJECTS } from '@supaglue/types/engagement';
import type { SyncStrategyType } from '@supaglue/types/sync';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import type { SyncConfigOverrides } from './SyncConfigOverridesSection';
import { SyncConfigOverridesSection } from './SyncConfigOverridesSection';
import { SyncStrategyConfigSection } from './SyncStrategyConfigSection';

const ONE_HOUR_SECONDS = 60 * 60;

const isSyncPeriodSecsValid = (syncPeriodSecs: number | undefined) => {
  if (!syncPeriodSecs) {
    return false;
  }
  return syncPeriodSecs < 60 ? false : true;
};

export function SyncConfigDetailsPanel(props: { syncConfigId: string } & SupaglueProps) {
  return <SyncConfigDetailsPanelImpl {...props} />;
}

export function NewSyncConfigPanel(props: SupaglueProps) {
  return <SyncConfigDetailsPanelImpl {...props} />;
}

type SyncConfigDetailsPanelImplProps = {
  syncConfigId?: string;
};

function SyncConfigDetailsPanelImpl({ syncConfigId }: SyncConfigDetailsPanelImplProps & SupaglueProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();
  const { syncConfigs = [], isLoading, mutate } = useSyncConfigs();
  const { providers = [], isLoading: isLoadingProviders } = useProviders();
  const { destinations = [], isLoading: isLoadingDestinations } = useDestinations();
  const { entities = [], isLoading: isLoadingEntities } = useEntities();
  const { entitiesWhitelistConfig, isLoading: isLoadingLekkoConfigs } = useLekkoConfigs();
  const [syncPeriodSecs, setSyncPeriodSecs] = useState<number | undefined>();
  const [fullSyncEveryNIncrementals, setFullSyncEveryNIncrementals] = useState<number | undefined>();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string | undefined>();
  const [destinationName, setDestinationName] = useState<string | undefined>();
  const [strategy, setStrategy] = useState<SyncStrategyType>('full then incremental');
  const [commonObjects, setCommonObjects] = useState<CommonObjectType[]>([]);
  const [standardObjects, setStandardObjects] = useState<string[]>([]);
  const [customObjects, setCustomObjects] = useState<string[]>([]);
  const [standardInputValue, setStandardInputValue] = useState<string>('');
  const [customInputValue, setCustomInputValue] = useState<string>('');
  const [entityIds, setEntityIds] = useState<string[]>([]);
  const [autoStartOnConnection, setAutoStartOnConnection] = useState<boolean>(true);
  const [numSyncsToBeDeleted, setNumSyncsToBeDeleted] = useState<number>(0);
  const [overrides, setOverrides] = useState<SyncConfigOverrides>({});
  const router = useRouter();

  const isFormValid = destinationName && providerName && isSyncPeriodSecsValid(syncPeriodSecs);

  const syncConfig = syncConfigs.find((s) => s.id === syncConfigId);

  useEffect(() => {
    setDestinationName(syncConfig?.destinationName);
    setProviderName(syncConfig?.providerName);
    setSyncPeriodSecs(
      syncConfig?.config?.defaultConfig?.periodMs
        ? syncConfig?.config?.defaultConfig?.periodMs / 1000
        : ONE_HOUR_SECONDS
    );
    setFullSyncEveryNIncrementals(syncConfig?.config?.defaultConfig?.fullSyncEveryNIncrementals ?? undefined);
    setAutoStartOnConnection(syncConfig?.config?.defaultConfig?.autoStartOnConnection ?? true);
    setStrategy(syncConfig?.config?.defaultConfig?.strategy ?? 'full then incremental');
    setCommonObjects(syncConfig?.config?.commonObjects?.map((o) => o.object) ?? []);
    setStandardObjects(syncConfig?.config?.standardObjects?.map((o) => o.object) ?? []);
    setCustomObjects(syncConfig?.config?.customObjects?.map((o) => o.object) ?? []);
    setEntityIds(syncConfig?.config?.entities?.map((entity) => entity.entityId) ?? []);
    setOverrides({
      common: syncConfig?.config?.commonObjects?.filter((o) => o.syncStrategyOverride || o.associationsToFetch),
      standard: syncConfig?.config?.standardObjects?.filter((o) => o.syncStrategyOverride || o.associationsToFetch),
      custom: syncConfig?.config?.customObjects?.filter((o) => o.syncStrategyOverride || o.associationsToFetch),
    });
  }, [syncConfig?.id]);

  if (isLoading || isLoadingProviders || isLoadingDestinations || isLoadingEntities || isLoadingLekkoConfigs) {
    return <Spinner />;
  }

  const formTitle = syncConfig ? 'Edit Sync Config' : 'New Sync Config';

  const populateSyncConfigData = (): SyncConfigData => {
    return {
      ...syncConfig?.config,
      defaultConfig: {
        ...syncConfig?.config.defaultConfig,
        periodMs: syncPeriodSecs ? syncPeriodSecs * 1000 : ONE_HOUR_SECONDS,
        strategy,
        fullSyncEveryNIncrementals: fullSyncEveryNIncrementals ?? undefined,
        autoStartOnConnection,
      },
      commonObjects: commonObjects.map((object) => overrides.common?.find((o) => o.object === object) ?? { object }),
      standardObjects: standardObjects.map(
        (object) => overrides.standard?.find((o) => o.object === object) ?? { object }
      ),
      customObjects: customObjects.map((object) => overrides.custom?.find((o) => o.object === object) ?? { object }),
      entities: entityIds.map((entityId) => ({ entityId })),
    };
  };

  const createOrUpdateSyncConfig = async (forceDeleteSyncs = false): Promise<SyncConfigDTO | undefined> => {
    if (!destinationName || !providerName) {
      addNotification({ message: 'Destination and Provider must be selected', severity: 'error' });
      return;
    }
    if (isLoading) {
      addNotification({ message: 'Cannot save while loading', severity: 'error' });
      return;
    }
    const provider = providers?.find((p) => p.name === providerName);
    if (!provider) {
      addNotification({ message: 'Provider not found', severity: 'error' });
      return;
    }
    if (!syncConfig && syncConfigs.find((s) => s.providerName === provider?.name)) {
      addNotification({ message: 'Sync config already exists for provider', severity: 'error' });
      return;
    }

    if (syncConfig) {
      const newSyncConfig: SyncConfigDTO = {
        ...syncConfig,
        config: populateSyncConfigData(),
      };
      const response = await updateSyncConfig(activeApplicationId, newSyncConfig, forceDeleteSyncs);
      if (!response.ok) {
        if (response.errorMessage.startsWith('This SyncConfig update operation will delete')) {
          const match = response.errorMessage.match(/~(\d+)/);
          if (match) {
            setNumSyncsToBeDeleted(parseInt(match[1], 10));
          }
          return;
        }
        addNotification({ message: response.errorMessage, severity: 'error' });
        return;
      }
      return response.data;
    }

    // create path
    const newSyncConfig: SyncConfigCreateParams = {
      applicationId: activeApplicationId,
      destinationName,
      providerName: providerName as ProviderName,
      config: populateSyncConfigData(),
    };
    const response = await createSyncConfig(activeApplicationId, newSyncConfig);
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    return response.data;
  };

  const selectedProvider = providers.find((p) => p.name === providerName);
  const supportsStandardObjects = ['hubspot', 'salesforce', 'ms_dynamics_365_sales', 'gong', 'intercom', 'linear'];
  const supportsCustomObjects = ['hubspot', 'salesforce', 'ms_dynamics_365_sales'];

  const selectedDestination = destinations.find((destination: any) => {
    const isManagedDestination = destination.type === 'supaglue' && destinationName === 'Supaglue Managed Destination'; // this logic is a bit hairy because "supaglue" destination type has no "name" field
    const isMatchedDestination = destination.name === destinationName;
    return isMatchedDestination || isManagedDestination;
  });

  // Common Objects are only supported for categorized providers and Postgres or Managed destinations
  const isPostgresOrManagedDestination =
    selectedDestination?.type === 'postgres' || selectedDestination?.type === 'supaglue';
  const commonObjectsSupported = selectedProvider?.category !== 'no_category' && isPostgresOrManagedDestination;

  const getCommonObjectOptions = (category: ProviderCategory) => {
    if (category === 'crm') {
      return CRM_COMMON_OBJECT_TYPES;
    } else if (category === 'engagement') {
      return ENGAGEMENT_SYNCABLE_COMMON_OBJECTS;
    }
    return [];
  };

  const standardObjectsOptions = getStandardObjectOptions(selectedProvider?.name);

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs>
        <Link color="inherit" href={`/applications/${activeApplicationId}`}>
          Home
        </Link>
        <Link color="inherit" href={`/applications/${activeApplicationId}/syncs/sync_configs`}>
          <Typography color="text.primary">Sync Configs</Typography>
        </Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Card>
        <ConfirmationModal
          open={!!numSyncsToBeDeleted}
          handleClose={() => setNumSyncsToBeDeleted(0)}
          onConfirm={async () => {
            setIsSaving(true);
            const newSyncConfig = await createOrUpdateSyncConfig(/*force_delete_syncs=*/ true);
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
              setIsSaving(false);
              router.back();
            }
            setIsSaving(false);
          }}
          title="Update Sync Config"
          cancelVariant="text"
          confirmVariant="contained"
          confirmColor="error"
          content={
            <Typography>
              Are you sure you want to update this Sync Config? This will delete syncs for{' '}
              <Typography fontWeight="bold" display="inline">
                {numSyncsToBeDeleted}
              </Typography>{' '}
              customers.
            </Typography>
          }
        />
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
                if (value === providerName) {
                  return;
                }
                setProviderName(value);
                setStandardObjects([]);
              }}
              value={providerName ?? ''}
              options={providers?.map(({ name }) => ({ value: name, displayValue: name })) ?? []}
            />
          </Stack>
          <Stack className="gap-2">
            <Typography variant="subtitle1">Destination</Typography>
            <Select
              name="Destination"
              disabled={isLoadingDestinations || !!syncConfig}
              onChange={async (value) => {
                if (value === 'create_new') {
                  await router.push(`/applications/${activeApplicationId}/connectors/destinations`);
                  return;
                }
                setDestinationName(value);
              }}
              value={destinationName ?? ''}
              options={[
                ...destinations.map((destination) => ({
                  value: getDestinationName(destination),
                  displayValue: getDestinationName(destination),
                })),
                {
                  value: 'create_new',
                  displayValue: (
                    <Link
                      color="inherit"
                      className="w-full"
                      href={`/applications/${activeApplicationId}/connectors/destinations`}
                    >
                      <i>Add new Destination</i>
                    </Link>
                  ),
                },
              ]}
            />
          </Stack>
          <SyncStrategyConfigSection
            syncPeriodSecs={syncPeriodSecs}
            setSyncPeriodSecs={setSyncPeriodSecs}
            strategy={strategy}
            setStrategy={setStrategy}
            fullSyncEveryNIncrementals={fullSyncEveryNIncrementals}
            setFullSyncEveryNIncrementals={setFullSyncEveryNIncrementals}
            autoStartOnConnection={autoStartOnConnection}
            setAutoStartOnConnection={setAutoStartOnConnection}
            isLoading={isLoading || isLoadingDestinations}
          />
          {selectedProvider && (
            <>
              <Stack className="gap-2">
                <Typography variant="subtitle1">Supaglue common objects</Typography>
                <Autocomplete
                  size="small"
                  disabled={!commonObjectsSupported}
                  key={providerName}
                  multiple
                  id="common-objects"
                  options={getCommonObjectOptions(selectedProvider.category)}
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
                    setCommonObjects(value as CommonObjectType[]);
                  }}
                />
              </Stack>
              <Stack className="gap-2">
                <Typography variant="subtitle1">Standard objects</Typography>
                <Autocomplete
                  disabled={!supportsStandardObjects.includes(String(selectedProvider?.name))}
                  size="small"
                  key={providerName}
                  multiple
                  id="standard-objects"
                  options={standardObjectsOptions}
                  value={standardObjects}
                  inputValue={standardInputValue}
                  autoSelect
                  freeSolo
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  onInputChange={(event, newInputValue) => {
                    if (newInputValue.endsWith(',')) {
                      const newObject = newInputValue.slice(0, -1).trim();
                      if (newObject) {
                        setStandardObjects([...standardObjects, newObject]);
                      }
                      setStandardInputValue('');
                      return;
                    }
                    setStandardInputValue(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Standard objects"
                      helperText={`Standard objects in ${selectedProvider?.name}. (Note: names are case-sensitive. Press enter or comma to add multiple fields.)`}
                    />
                  )}
                  onChange={(event: any, value: string[]) => {
                    setStandardObjects(value.map((v) => v.trim()));
                  }}
                />
              </Stack>
              <Stack className="gap-2">
                <Typography variant="subtitle1">Custom objects</Typography>
                <Autocomplete
                  disabled={!supportsCustomObjects.includes(String(selectedProvider?.name))}
                  size="small"
                  key={providerName}
                  multiple
                  id="custom-objects"
                  options={[]}
                  value={customObjects}
                  inputValue={customInputValue}
                  autoSelect
                  freeSolo
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  onInputChange={(event, newInputValue) => {
                    if (newInputValue.endsWith(',')) {
                      const newObject = newInputValue.slice(0, -1).trim();
                      if (newObject) {
                        setCustomObjects([...customObjects, newObject]);
                      }
                      setCustomInputValue('');
                      return;
                    }
                    setCustomInputValue(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Custom objects"
                      helperText={`Custom objects in ${selectedProvider?.name}. (Note: names are case-sensitive. Press enter or comma to add multiple fields. ${
                        selectedProvider?.name === 'salesforce' ? 'For Salesforce, these should all end with __c.' : ''
                      })`}
                    />
                  )}
                  onChange={(event: any, value: string[]) => {
                    setCustomObjects(value.map((v) => v.trim()));
                  }}
                />
              </Stack>
              {entitiesEnabled(entitiesWhitelistConfig.applicationIds, activeApplicationId) && (
                <Stack className="gap-2">
                  <Typography variant="subtitle1">Entities</Typography>
                  <Autocomplete
                    size="small"
                    key={providerName}
                    multiple
                    id="entities"
                    options={entities.map((entity) => entity.id)}
                    defaultValue={entityIds}
                    autoSelect
                    renderTags={(value: readonly string[], getTagProps) =>
                      value.map((option: string, index: number) => {
                        const entity = entities.find((e) => e.id === option);
                        return <Chip variant="outlined" label={entity?.name ?? option} {...getTagProps({ index })} />;
                      })
                    }
                    getOptionLabel={(option) => {
                      const entity = entities.find((e) => e.id === option);
                      return entity?.name ?? option;
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Entities" helperText={'Use "enter" to add multiple entities.'} />
                    )}
                    onChange={(event: any, value: string[]) => {
                      setEntityIds(value.map((object) => object.trim()));
                    }}
                  />
                </Stack>
              )}
              <SyncConfigOverridesSection
                providerName={providerName}
                commonObjects={commonObjects}
                standardObjects={standardObjects}
                customObjects={customObjects}
                overrides={overrides}
                defaultConfig={{
                  ...syncConfig?.config.defaultConfig,
                  periodMs: syncPeriodSecs ? syncPeriodSecs * 1000 : ONE_HOUR_SECONDS,
                  strategy,
                  fullSyncEveryNIncrementals: fullSyncEveryNIncrementals ?? undefined,
                  autoStartOnConnection,
                }}
                setOverrides={setOverrides}
              />
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
                  setIsSaving(false);
                  router.back();
                }
                setIsSaving(false);
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
