import { pauseSync, resumeSync, triggerSync } from '@/client';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { SYNCS_PAGE_SIZE } from '@/hooks/useSyncs';
import { millisToHumanReadable } from '@/utils/datetime';
import type { SyncFilterBy, SyncFilterParams } from '@/utils/filter';
import { getFriendlySyncStrategyType, getSyncStrategyConfigAndHubspotAssociationsToFetch } from '@/utils/syncConfig';
import { Button, Stack } from '@mui/material';
import Switch from '@mui/material/Switch';
import type { GridColDef } from '@mui/x-data-grid-pro';
import { DataGridPro, getGridStringOperators, GridLogicOperator, GridToolbar } from '@mui/x-data-grid-pro';
import type { PaginatedResult } from '@supaglue/types';
import type { SyncDTO } from '@supaglue/types/sync';
import { useState } from 'react';
import type { KeyedMutator } from 'swr';

export type SyncsTableProps = {
  isLoading: boolean;
  rowCount: number;
  data: SyncDTO[];
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handleFilters: (newFilterParams?: SyncFilterParams[]) => void;
  mutate: KeyedMutator<PaginatedResult<SyncDTO>>;
};

const equalOperatorOnly = getGridStringOperators().filter((operator) => operator.value === 'equals');

export default function SyncsTable(props: SyncsTableProps) {
  const { data, rowCount, handleNextPage, handlePreviousPage, isLoading, mutate, handleFilters } = props;
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: SYNCS_PAGE_SIZE,
  });

  const applicationId = useActiveApplicationId();
  const { addNotification } = useNotification();

  const columns: GridColDef[] = [
    {
      field: 'customerId',
      headerName: 'Customer Id',
      width: 200,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
    },
    {
      field: 'providerName',
      headerName: 'Provider',
      width: 120,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
    },
    {
      field: 'objectType',
      headerName: 'Object Type',
      width: 120,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
    },
    {
      field: 'object',
      headerName: 'Object',
      width: 120,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
    },
    {
      field: '_frequency',
      headerName: 'Frequency',
      width: 120,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
      renderCell: (params) => {
        const sync = params.row;
        const { syncConfig } = params.row;
        const activeSyncStrategy = getSyncStrategyConfigAndHubspotAssociationsToFetch(syncConfig, sync);
        const friendlyPeriodMs = millisToHumanReadable(activeSyncStrategy.periodMs);
        return (
          <span className="text-ellipsis overflow-hidden" title={friendlyPeriodMs}>
            {friendlyPeriodMs}
          </span>
        );
      },
    },
    {
      field: '_strategy',
      headerName: 'Strategy',
      width: 140,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
      renderCell: (params) => {
        const sync = params.row;
        const { syncConfig } = params.row;
        const activeSyncStrategy = getSyncStrategyConfigAndHubspotAssociationsToFetch(syncConfig, sync);
        return <span>{getFriendlySyncStrategyType(activeSyncStrategy.strategy) || 'incremental'}</span>;
      },
    },
    {
      field: '_periodicFull',
      headerName: 'Periodic Full',
      width: 140,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
      renderCell: (params) => {
        const sync = params.row;
        const { syncConfig } = params.row;
        const activeSyncStrategy = getSyncStrategyConfigAndHubspotAssociationsToFetch(syncConfig, sync);

        if (activeSyncStrategy.fullSyncEveryNIncrementals !== undefined) {
          return <span>every {activeSyncStrategy.fullSyncEveryNIncrementals} incremental</span>;
        }

        return <span>none</span>;
      },
    },
    {
      field: '_associationsToFetch',
      headerName: 'Fetched Associations',
      width: 120,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
      renderCell: (params) => {
        const sync = params.row;
        const { syncConfig } = params.row;
        const activeSyncStrategy = getSyncStrategyConfigAndHubspotAssociationsToFetch(syncConfig, sync);

        if (activeSyncStrategy.associationsToFetch !== undefined) {
          const csvAssociationsToFetch = activeSyncStrategy.associationsToFetch.join(',');
          return (
            <span className="text-ellipsis overflow-hidden" title={csvAssociationsToFetch}>
              {csvAssociationsToFetch}
            </span>
          );
        }

        return <span>default</span>;
      },
    },
    {
      field: 'active',
      headerName: 'Active?',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <Switch
            checked={!params.row.paused}
            onChange={async (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
              if (!checked) {
                const response =
                  params.row.type === 'object'
                    ? await pauseSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        objectType: params.row.objectType,
                        object: params.row.object,
                      })
                    : await pauseSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        entityId: params.row.entityId,
                      });
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
                const response =
                  params.row.type === 'object'
                    ? await resumeSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        objectType: params.row.objectType,
                        object: params.row.object,
                      })
                    : await resumeSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        entityId: params.row.entityId,
                      });
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
      filterable: false,
      renderCell: (params) => {
        // buttons to trigger sync run
        return (
          <Stack direction="row" className="gap-2">
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                const response =
                  params.row.type === 'object'
                    ? await triggerSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        objectType: params.row.objectType,
                        object: params.row.object,
                      })
                    : await triggerSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        entityId: params.row.entityId,
                      });
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
                const response =
                  params.row.type === 'object'
                    ? await triggerSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        objectType: params.row.objectType,
                        object: params.row.object,
                        performFullRefresh: true,
                      })
                    : await triggerSync({
                        applicationId,
                        customerId: params.row.customerId,
                        providerName: params.row.providerName,
                        entityId: params.row.entityId,
                        performFullRefresh: true,
                      });
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
      <DataGridPro
        density="compact"
        disableDensitySelector
        pageSizeOptions={[SYNCS_PAGE_SIZE]}
        filterMode="server"
        onFilterModelChange={(model) => {
          if (model.items.length === 0) {
            handleFilters(undefined);
            return;
          }
          const filters = model.items
            .map(({ field, value }) => ({
              filterBy: field as SyncFilterBy,
              value: value as string,
            }))
            .filter(({ value }) => !!value);
          handleFilters(filters);
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          filterPanel: {
            logicOperators: [GridLogicOperator.And],
          },
        }}
        loading={isLoading}
        rowCount={rowCount}
        rows={data ?? []}
        columns={columns}
        pagination
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
