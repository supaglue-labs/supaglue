import { deleteSyncConfig } from '@/client';
import MetricCard from '@/components/MetricCard';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { useEntities } from '@/hooks/useEntities';
import { useProviders } from '@/hooks/useProviders';
import { toGetSyncConfigsResponse, useSyncConfigs } from '@/hooks/useSyncConfigs';
import type { SupaglueProps } from '@/pages/applications/[applicationId]';
import getIcon from '@/utils/companyToIcon';
import { millisToHumanReadable } from '@/utils/datetime';
import { getDestinationName } from '@/utils/destination';
import providerToIcon from '@/utils/providerToIcon';
import { PeopleAltOutlined } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { SyncConfigDTO } from '@supaglue/types';
import { SUPAGLUE_MANAGED_DESTINATION } from '@supaglue/utils';
import Link from 'next/link';
import { DeleteSyncConfig } from './DeleteSyncConfig';

export default function SyncConfigListPanel(props: SupaglueProps) {
  const { syncConfigs = [], isLoading, mutate } = useSyncConfigs();
  const { providers = [], isLoading: isLoadingProviders } = useProviders();
  const { destinations = [], isLoading: isLoadingDestinations } = useDestinations();
  const { entities = [], isLoading: isLoadingEntities } = useEntities();
  const applicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  if (isLoading || isLoadingProviders || isLoadingDestinations || isLoadingEntities) {
    return <Spinner />;
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 275,
      renderCell: (params) => {
        return (
          <Link
            href={`/applications/${applicationId}/syncs/sync_configs/${params.id}`}
            className="flex flex-row gap-2 items-center w-full h-full"
            style={{
              textDecoration: 'none',
            }}
          >
            {params.id}
          </Link>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      width: 75,
      sortable: false,
      renderCell: (params) => {
        const provider = providers.find((provider) => provider.name === params.row.provider);
        if (!provider) {
          return <i>Unknown provider</i>;
        }
        return (
          <Link
            href={`/applications/${applicationId}/connectors/providers/${provider.category}/${provider.name}`}
            className="flex flex-row gap-2 items-center w-full h-full"
          >
            {providerToIcon(provider.name)}
          </Link>
        );
      },
    },
    {
      field: 'destination',
      headerName: 'Destination',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const destination = destinations.find((destination) => {
          if (destination.type === 'supaglue') {
            return params.row.destination === SUPAGLUE_MANAGED_DESTINATION;
          }
          return destination.name === params.row.destination;
        });
        if (!destination) {
          return <i>Unknown destination</i>;
        }
        return (
          <Link
            href={`/applications/${applicationId}/connectors/destinations/${destination.id}`}
            style={{
              color: 'inherit',
              textDecoration: 'inherit',
            }}
            className="flex flex-row gap-2 items-center w-full h-full"
          >
            {getIcon(destination.type)}
            <p>{getDestinationName(destination)}</p>
          </Link>
        );
      },
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      width: 100,
      renderCell: (params) => {
        return (
          <span className="whitespace-normal" title={params.row.objects}>
            {params.row.frequency}
          </span>
        );
      },
    },
    {
      field: 'objects',
      headerName: 'Objects',
      width: 150,
      renderCell: (params) => {
        return (
          <span className="whitespace-normal" title={params.row.objects}>
            {params.row.objects}
          </span>
        );
      },
    },
    {
      field: 'entities',
      headerName: 'Entities',
      width: 150,
      renderCell: (params) => {
        return <span className="whitespace-normal">{params.row.entities}</span>;
      },
    },
    {
      field: '_',
      headerName: 'Admin',
      width: 100,
      renderCell: (params) => {
        return (
          <Stack direction="row" className="items-center justify-between w-full">
            <Link
              href={`/applications/${applicationId}/syncs/sync_configs/${params.id}`}
              className="flex flex-row gap-2 items-center w-full h-full"
              style={{
                textDecoration: 'none',
              }}
            >
              Edit
            </Link>
            <DeleteSyncConfig
              syncConfigId={params.row.id}
              onDelete={async () => {
                const response = await deleteSyncConfig(applicationId, params.row.id, /* force_delete_syncs */ true);
                if (!response.ok) {
                  addNotification({ message: response.errorMessage, severity: 'error' });
                  return;
                }
                addNotification({ message: 'Successfully removed Sync Config', severity: 'success' });
                await mutate(toGetSyncConfigsResponse(syncConfigs.filter((s) => s.id !== params.row.id)), false);
              }}
            />
          </Stack>
        );
      },
    },
  ];

  const rows = syncConfigs.map((syncConfig) => ({
    id: syncConfig.id,
    provider: syncConfig.providerName,
    destination: syncConfig.destinationName,
    frequency: `every ${millisToHumanReadable(syncConfig.config.defaultConfig.periodMs)}`,
    objects: getObjectsString(syncConfig),
    entities: getEntitiesString(entities, syncConfig),
  }));

  return (
    <div className="flex flex-col gap-4">
      <MetricCard
        icon={<PeopleAltOutlined />}
        className="w-[calc(100vw-26rem)]"
        value={
          <Stack direction="row" className="align-center justify-between">
            <div>
              {syncConfigs.length} Sync {syncConfigs.length === 1 ? 'Config' : 'Configs'}
            </div>
            <div className="p-1">
              <Link
                href={`/applications/${applicationId}/syncs/sync_configs/new`}
                className="flex flex-row gap-2 items-center w-full h-full"
                style={{
                  textDecoration: 'inherit',
                  color: 'rgba(0, 0, 0, 0.54)',
                }}
              >
                <Button color="primary" variant="outlined" size="small">
                  Add
                </Button>
              </Link>
            </div>
          </Stack>
        }
      />
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        sx={{
          boxShadow: 1,
          backgroundColor: 'white',
        }}
        density="comfortable"
        hideFooter
        disableColumnMenu
        rowSelection={false}
      />
    </div>
  );
}

function getObjectsString(syncConfig: SyncConfigDTO): string {
  const objectsList = [];
  if (syncConfig.config.commonObjects?.length) {
    objectsList.push(...syncConfig.config.commonObjects.map((object) => object.object));
  }
  if (syncConfig.config.standardObjects?.length) {
    objectsList.push(...syncConfig.config.standardObjects.map((object) => object.object));
  }
  if (syncConfig.config.customObjects?.length) {
    objectsList.push(...syncConfig.config.customObjects.map((object) => object.object));
  }
  if (objectsList.length > 6) {
    return `${objectsList.slice(0, 6).join(', ')}...`;
  }
  return objectsList.join(', ');
}

function getEntitiesString(allEntities: ReturnType<typeof useEntities>['entities'], syncConfig: SyncConfigDTO): string {
  return (
    syncConfig.config.entities
      ?.map((entity) => {
        const matchingEntity = allEntities?.find((e) => e.id === entity.entityId);
        if (!matchingEntity) {
          return entity.entityId;
        }
        return matchingEntity.name;
      })
      ?.join(', ') ?? ''
  );
}
