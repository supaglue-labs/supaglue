/* eslint-disable @typescript-eslint/no-floating-promises */
import { createSyncConfig, updateSyncConfig } from '@/client';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { useProviders } from '@/hooks/useProviders';
import { useSyncConfig } from '@/hooks/useSyncConfig';
import { useSyncConfigs } from '@/hooks/useSyncConfigs';
import { Button, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { CommonObjectConfig, ProviderCategory, SyncConfig, SyncConfigCreateParams, SyncType } from '@supaglue/types';
import { CRM_COMMON_MODEL_TYPES } from '@supaglue/types/crm';
import { ENGAGEMENT_COMMON_MODEL_TYPES } from '@supaglue/types/engagement';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ONE_HOUR_SECONDS = 60 * 60;

const isSyncPeriodSecsValid = (syncPeriodSecs: number) => {
  return syncPeriodSecs < 60 ? false : true;
};

export type SyncConfigDetailsPanelProps = {
  syncConfigId: string;
};

export default function SyncConfigDetailsPanel({ syncConfigId }: SyncConfigDetailsPanelProps) {
  const activeApplicationId = useActiveApplicationId();
  const { addNotification } = useNotification();
  const { syncConfig, isLoading } = useSyncConfig(syncConfigId);
  const { syncConfigs = [], mutate } = useSyncConfigs();
  const { providers, isLoading: isLoadingProviders } = useProviders();
  const { destinations, isLoading: isLoadingDestinations } = useDestinations();
  const [syncPeriodSecs, setSyncPeriodSecs] = useState<number | undefined>();
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [providerId, setProviderId] = useState<string | undefined>();
  const [destinationId, setDestinationId] = useState<string | undefined>();
  const [strategy, setStrategy] = useState<SyncType>('full then incremental');
  const router = useRouter();

  useEffect(() => {
    setDestinationId(syncConfig?.destinationId ?? undefined);
    setProviderId(syncConfig?.providerId ?? undefined);
    setSyncPeriodSecs(
      syncConfig?.config?.defaultConfig?.periodMs ? syncConfig?.config?.defaultConfig?.periodMs / 1000 : undefined
    );
    setStrategy(syncConfig?.config?.defaultConfig?.strategy ?? 'full then incremental');
  }, [syncConfig?.id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!syncConfig) {
    return null;
  }

  const createOrUpdateSyncConfig = async (): Promise<SyncConfig> => {
    if (!destinationId || !providerId) {
      throw new Error('Destination and Provider must be selected');
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
        },
      };
      return await updateSyncConfig(activeApplicationId, newSyncConfig);
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
        commonObjects: getDefaultCommonObjects(provider.category, false),
      },
    };
    return await createSyncConfig(activeApplicationId, newSyncConfig);
  };

  return (
    <Card>
      <Stack direction="column" className="gap-4" sx={{ padding: '2rem' }}>
        <Stack direction="row" className="items-center justify-between w-full">
          <Stack direction="row" className="items-center justify-center gap-2">
            <Stack direction="column">
              <Typography variant="subtitle1">{syncConfig.id}</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Stack className="gap-2">
          <Typography variant="subtitle1">Provider</Typography>
          <Select
            name="Provider"
            disabled={isLoadingProviders}
            onChange={setProviderId}
            value={providerId ?? ''}
            options={providers?.map(({ id, name }) => ({ value: id, displayValue: name })) ?? []}
            unselect
          />
        </Stack>
        <Stack className="gap-2">
          <Typography variant="subtitle1">Destination</Typography>
          <Select
            name="Destination"
            disabled={isLoadingDestinations}
            onChange={setDestinationId}
            value={destinationId ?? ''}
            options={destinations?.map(({ id, name }) => ({ value: id, displayValue: name })) ?? []}
            unselect
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
              setIsFormValid(value !== undefined && isSyncPeriodSecsValid(value));
            }}
          />
        </Stack>
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
            disabled={isSaving || isLoading}
            onClick={async () => {
              setIsSaving(true);
              const newSyncConfig = await createOrUpdateSyncConfig();
              const latestSyncConfigs = [
                ...syncConfigs.filter((syncConfig) => syncConfig.id !== newSyncConfig.id),
                newSyncConfig,
              ];
              addNotification({ message: 'Successfully updated Sync Config', severity: 'success' });
              await mutate(latestSyncConfigs, {
                optimisticData: latestSyncConfigs,
                revalidate: false,
                populateCache: false,
              });
              setIsSaving(false);
            }}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

const getDefaultCommonObjects = (category: ProviderCategory, fetchAllFieldsIntoRaw: boolean): CommonObjectConfig[] => {
  if (category === 'engagement') {
    return ENGAGEMENT_COMMON_MODEL_TYPES.map((object) => ({
      object,
      fetchAllFieldsIntoRaw,
    }));
  }
  return CRM_COMMON_MODEL_TYPES.map((object) => ({
    object,
    fetchAllFieldsIntoRaw,
  }));
};
