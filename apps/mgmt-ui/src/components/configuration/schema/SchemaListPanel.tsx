import { deleteSchema } from '@/client';
import MetricCard from '@/components/MetricCard';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useProviders } from '@/hooks/useProviders';
import { toGetSchemasResponse, useSchemas } from '@/hooks/useSchemas';
import { PeopleAltOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Breadcrumbs, IconButton, Stack, Typography } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { Provider } from '@supaglue/types';
import Link from 'next/link';
import { DeleteSchema } from './DeleteSchema';

export default function SchemaListPanel() {
  const { schemas = [], isLoading, mutate } = useSchemas();
  const { providers = [], isLoading: isLoadingProviders } = useProviders();
  const applicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  if (isLoading || isLoadingProviders) {
    return <Spinner />;
  }

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 275,
      renderCell: (params) => {
        return (
          <Link
            href={`/applications/${applicationId}/configuration/schemas/${params.row.id}`}
            className="flex flex-row gap-2 items-center w-full h-full"
            style={{
              textDecoration: 'none',
            }}
          >
            {params.row.name}
          </Link>
        );
      },
    },
    {
      field: 'fields',
      headerName: 'fields',
      width: 300,
      sortable: false,
      renderCell: (params) => {
        return getFieldsListAsString(params.row.fields);
      },
    },
    {
      field: 'providers',
      headerName: 'Providers',
      width: 300,
      sortable: false,
      renderCell: (params) => {
        return (
          <Stack direction="row" spacing={1}>
            {providers.flatMap((provider) => {
              const objects = getObjectNamesUsingSchema(provider, params.row.id);
              return objects.map((object) => {
                return (
                  <Link
                    href={`/applications/${applicationId}/configuration/providers/${provider.category}/${provider.name}`}
                    className="flex flex-row gap-2 items-center w-full h-full"
                  >
                    {object}
                  </Link>
                );
              });
            })}
          </Stack>
        );
      },
    },
    {
      field: '_',
      headerName: 'Admin',
      width: 75,
      renderCell: (params) => {
        return (
          <DeleteSchema
            schemaId={params.row.id}
            onDelete={async () => {
              const response = await deleteSchema(applicationId, params.row.id);
              if (!response.ok) {
                addNotification({ message: response.errorMessage, severity: 'error' });
                return;
              }
              addNotification({ message: 'Successfully removed Schema', severity: 'success' });
              await mutate(toGetSchemasResponse(schemas.filter((s) => s.id !== params.row.id)), false);
            }}
          />
        );
      },
    },
  ];

  const rows = schemas.map((schema) => ({
    id: schema.id,
    name: schema.name,
    fields: schema.config.fields.map(({ name }) => name),
  }));

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs>
        <Link color="inherit" href={`/applications/${applicationId}`}>
          Home
        </Link>
        <Typography color="text.primary">Schemas</Typography>
      </Breadcrumbs>
      <MetricCard
        icon={<PeopleAltOutlined />}
        className="w-[calc(100vw-26rem)]"
        value={
          <Stack direction="row" className="align-center justify-between">
            <div>
              {schemas.length} {schemas.length === 1 ? 'Schema' : 'Schemas'}
            </div>
            <IconButton className="p-1" size="small">
              <Link
                href={`/applications/${applicationId}/configuration/schemas/new`}
                className="flex flex-row gap-2 items-center w-full h-full"
                style={{
                  textDecoration: 'inherit',
                  color: 'rgba(0, 0, 0, 0.54)',
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

function getFieldsListAsString(fields: string[]): string {
  if (fields.length <= 5) {
    return fields.join(', ');
  }
  return `${fields.slice(0, 5).join(', ')}, ...`;
}

function getObjectNamesUsingSchema(provider: Provider, schemaId: string): string[] {
  if (!provider.objects) {
    return [];
  }
  const out: string[] = [];
  out.push(
    ...((provider.objects.common as unknown as { name: string; schemaId?: string }[] | undefined)
      ?.filter((object) => object.schemaId === schemaId)
      .map((object) => object.name) ?? [])
  );
  out.push(
    ...(provider.objects.standard?.filter((object) => object.schemaId === schemaId).map((object) => object.name) ?? [])
  );
  out.push(
    ...(provider.objects.custom?.filter((object) => object.schemaId === schemaId).map((object) => object.name) ?? [])
  );
  return out;
}
