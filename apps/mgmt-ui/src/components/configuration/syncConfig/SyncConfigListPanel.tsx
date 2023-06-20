import MetricCard from '@/components/MetricCard';
import Spinner from '@/components/Spinner';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { useProviders } from '@/hooks/useProviders';
import { useSyncConfigs } from '@/hooks/useSyncConfigs';
import getIcon from '@/utils/companyToIcon';
import providerToIcon from '@/utils/providerToIcon';
import { PeopleAltOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { IconButton, Stack } from '@mui/material';
import Link from '@mui/material/Link';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export default function SyncConfigListPanel() {
  const { syncConfigs = [], isLoading } = useSyncConfigs();
  const { providers = [], isLoading: isLoadingProviders } = useProviders();
  const { destinations = [], isLoading: isLoadingDestinations } = useDestinations();
  const applicationId = useActiveApplicationId();

  if (isLoading || isLoadingProviders || isLoadingDestinations) {
    return <Spinner />;
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 300,
      renderCell: (params) => {
        return (
          <Link
            href={`/applications/${applicationId}/configuration/sync_configs/${params.id}`}
            className="flex flex-row gap-2 items-center w-full h-full"
            sx={{
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
      width: 100,
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
            sx={{
              textDecoration: 'none',
            }}
            className="flex flex-row gap-2 items-center w-full h-full"
          >
            {getIcon(destination.type)}
            <p>{destination.name}</p>
          </Link>
        );
      },
    },
    { field: 'frequency', headerName: 'Frequency', width: 250 },
  ];

  const rows = syncConfigs.map((syncConfig) => ({
    id: syncConfig.id,
    provider: syncConfig.providerId,
    destination: syncConfig.destinationId,
    frequency: `every ${millisToHumanReadable(syncConfig.config.defaultConfig.periodMs)}`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <MetricCard
        className="max-w-2xl"
        icon={<PeopleAltOutlined />}
        value={
          <Stack direction="row" className="align-center justify-center justify-between">
            <div>
              {syncConfigs.length} Sync {syncConfigs.length === 1 ? 'Configuration' : 'Configurations'}
            </div>
            <IconButton className="p-1" size="small">
              <Link
                href={`/applications/${applicationId}/configuration/sync_configs/new`}
                className="flex flex-row gap-2 items-center w-full h-full"
                sx={{
                  color: 'rgba(0, 0, 0, 0.54);',
                }}
              >
                <AddIcon />
              </Link>
            </IconButton>
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
