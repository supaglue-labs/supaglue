import { pauseSync, resumeSync, triggerSync } from '@/client';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { Button, Stack } from '@mui/material';
import Switch from '@mui/material/Switch';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { PaginatedResult } from '@supaglue/types';
import type { ObjectSyncDTO } from '@supaglue/types/sync';
import { useState } from 'react';
import type { KeyedMutator } from 'swr';

export type SyncsTableProps = {
  isLoading: boolean;
  rowCount: number;
  data: ObjectSyncDTO[];
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  mutate: KeyedMutator<PaginatedResult<ObjectSyncDTO>>;
};

export default function SyncsTable(props: SyncsTableProps) {
  const { data, rowCount, handleNextPage, handlePreviousPage, isLoading, mutate } = props;
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });

  const applicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  const columns: GridColDef[] = [
    { field: 'customerId', headerName: 'Customer Id', width: 200, sortable: false },
    { field: 'providerName', headerName: 'Provider', width: 120, sortable: false },
    { field: 'objectType', headerName: 'Object Type', width: 120, sortable: false },
    { field: 'object', headerName: 'Object', width: 120, sortable: false },
    {
      field: 'paused',
      headerName: 'Paused?',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <Switch
            checked={params.row.paused}
            onChange={async (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
              if (checked) {
                const response = await pauseSync(
                  applicationId,
                  params.row.customerId,
                  params.row.providerName,
                  params.row.objectType,
                  params.row.object
                );
                if (!response.ok) {
                  addNotification({ message: response.errorMessage, severity: 'error' });
                  return;
                }
                await mutate(
                  (prev) =>
                    prev
                      ? {
                          ...prev,
                          results: data.map((s) => ({
                            ...s,
                            paused: s.id === params.row.id ? true : s.paused,
                          })),
                        }
                      : undefined,
                  false
                );
              } else {
                const response = await resumeSync(
                  applicationId,
                  params.row.customerId,
                  params.row.providerName,
                  params.row.objectType,
                  params.row.object
                );
                if (!response.ok) {
                  addNotification({ message: response.errorMessage, severity: 'error' });
                  return;
                }
                await mutate(
                  (prev) =>
                    prev
                      ? {
                          ...prev,
                          results: data.map((s) => ({
                            ...s,
                            paused: s.id === params.row.id ? false : s.paused,
                          })),
                        }
                      : undefined,
                  false
                );
              }
            }}
          />
        );
      },
    },
    {
      field: '_',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        // buttons to trigger sync run
        return (
          <Stack direction="row" className="gap-2">
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                const response = await triggerSync(
                  applicationId,
                  params.row.customerId,
                  params.row.providerName,
                  params.row.objectType,
                  params.row.object
                );
                if (!response.ok) {
                  addNotification({ message: response.errorMessage, severity: 'error' });
                  return;
                }
                addNotification({ message: 'Sync triggered', severity: 'success' });
              }}
            >
              Trigger
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                const response = await triggerSync(
                  applicationId,
                  params.row.customerId,
                  params.row.providerName,
                  params.row.objectType,
                  params.row.object,
                  /* performFullRefresh */ true
                );
                if (!response.ok) {
                  addNotification({ message: response.errorMessage, severity: 'error' });
                  return;
                }
                addNotification({ message: 'Full sync triggered', severity: 'success' });
              }}
            >
              Trigger Full
            </Button>
          </Stack>
        );
      },
    },
  ];

  return (
    <div style={{ height: 750, width: '100%' }}>
      <DataGrid
        density="compact"
        pageSizeOptions={[100]}
        disableColumnFilter
        disableColumnMenu
        loading={isLoading}
        rowCount={rowCount}
        rows={data ?? []}
        columns={columns}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={(newPaginationModel) => {
          setPaginationModel(newPaginationModel);
          if (newPaginationModel.page > paginationModel.page) {
            handleNextPage();
          } else {
            handlePreviousPage();
          }
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: 'paused', sort: 'desc' }],
          },
        }}
        sx={{
          boxShadow: 1,
          backgroundColor: 'white',
        }}
      />
    </div>
  );
}
