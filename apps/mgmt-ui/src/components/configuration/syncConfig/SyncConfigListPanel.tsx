import { deleteSyncConfig } from '@/client';
import MetricCard from '@/components/MetricCard';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { useEntities } from '@/hooks/useEntities';
import { useProviders } from '@/hooks/useProviders';
import { toGetSyncConfigsResponse, useSyncConfigs } from '@/hooks/useSyncConfigs';
import getIcon from '@/utils/companyToIcon';
import providerToIcon from '@/utils/providerToIcon';
import { PeopleAltOutlined } from '@mui/icons-material';
import { Breadcrumbs, Button, Stack, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { SyncConfig } from '@supaglue/types';
import Link from 'next/link';
import { DeleteSyncConfig } from './DeleteSyncConfig';

export default function SyncConfigListPanel() {
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
            href={`/applications/${applicationId}/configuration/sync_configs/${params.id}`}
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
        const provider = providers.find((provider) => provider.id === params.row.provider);
        if (!provider) {
          return <i>Unknown provider</i>;
        }
        return (
          <Link
            href={`/applications/${applicationId}/configuration/providers/${provider.category}/${provider.name}`}
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
        const destination = destinations.find((destination) => destination.id === params.row.destination);
        if (!destination) {
          return <i>Unknown destination</i>;
        }
        return (
          <Link
            href={`/applications/${applicationId}/configuration/destinations/${destination.id}`}
            style={{
              color: 'inherit',
              textDecoration: 'inherit',
            }}
            className="flex flex-row gap-2 items-center w-full h-full"
          >
            {getIcon(destination.type)}
            <p>{destination.name}</p>
          </Link>
        );
      },
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      width: 100,
      renderCell: (params) => {
        return <span className="whitespace-normal">{params.row.frequency}</span>;
      },
    },
    {
      field: 'objects',
      headerName: 'Objects',
      width: 150,
      renderCell: (params) => {
        return <span className="whitespace-normal">{params.row.objects}</span>;
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
      width: 75,
      renderCell: (params) => {
        return (
          <DeleteSyncConfig
            syncConfigId={params.row.id}
            onDelete={async () => {
              const response = await deleteSyncConfig(applicationId, params.row.id);
              if (!response.ok) {
                addNotification({ message: response.errorMessage, severity: 'error' });
                return;
              }
              addNotification({ message: 'Successfully removed Sync Config', severity: 'success' });
              await mutate(toGetSyncConfigsResponse(syncConfigs.filter((s) => s.id !== params.row.id)), false);
            }}
          />
        );
      },
    },
  ];

  const rows = syncConfigs.map((syncConfig) => ({
    id: syncConfig.id,
    provider: syncConfig.providerId,
    destination: syncConfig.destinationId,
    frequency: `every ${millisToHumanReadable(syncConfig.config.defaultConfig.periodMs)}`,
    objects: getObjectsString(syncConfig),
    entities: getEntitiesString(entities, syncConfig),
  }));

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs>
        <Link color="inherit" href={`/applications/${applicationId}`}>
          Home
        </Link>
        <Typography color="text.primary">Sync Configs</Typography>
      </Breadcrumbs>
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
                href={`/applications/${applicationId}/configuration/sync_configs/new`}
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

function millisToHumanReadable(millis: number): string {
  const seconds = Math.floor((millis / 1000) % 60);
  const minutes = Math.floor((millis / (1000 * 60)) % 60);
  const hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
  const days = Math.floor(millis / (1000 * 60 * 60 * 24));

  let humanReadable = '';

  // Add days if any
  if (days > 0) {
    humanReadable += `${days} day${days > 1 ? 's' : ''}, `;
  }

  // Add hours if any
  if (hours > 0) {
    humanReadable += `${hours} hour${hours > 1 ? 's' : ''}, `;
  }

  // Add minutes if any
  if (minutes > 0) {
    humanReadable += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
  }

  // Add seconds
  if (seconds > 0) {
    humanReadable += `${seconds} second${seconds > 1 || seconds === 0 ? 's' : ''}`;
  }

  if (humanReadable.endsWith(', ')) {
    humanReadable = humanReadable.slice(0, -2);
  }

  return humanReadable;
}

function getObjectsString(syncConfig: SyncConfig): string {
  const objectsList = [];
  if (syncConfig.config.commonObjects?.length) {
    objectsList.push(...syncConfig.config.commonObjects.map((object) => object.object));
  }
  if (syncConfig.config.standardObjects?.length) {
    objectsList.push(...syncConfig.config.standardObjects.map((object) => object.object));
  }
  if (objectsList.length > 6) {
    return `${objectsList.slice(0, 6).join(', ')}...`;
  }
  return objectsList.join(', ');
}

function getEntitiesString(allEntities: ReturnType<typeof useEntities>['entities'], syncConfig: SyncConfig): string {
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
