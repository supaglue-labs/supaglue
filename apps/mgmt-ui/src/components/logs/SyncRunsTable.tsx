import { useEntities } from '@/hooks/useEntities';
import { SYNC_RUNS_PAGE_SIZE } from '@/hooks/useSyncRuns';
import { datetimeStringFromISOString } from '@/utils/datetime';
import type { SyncRunFilterBy, SyncRunFilterParams } from '@/utils/filter';
import type { GridColDef } from '@mui/x-data-grid-pro';
import {
  DataGridPro,
  getGridDateOperators,
  getGridStringOperators,
  GridLogicOperator,
  GridToolbar,
} from '@mui/x-data-grid-pro';
import type { SyncRun } from '@supaglue/types/sync_run';
import { useState } from 'react';

export type SyncRunsTableProps = {
  isLoading: boolean;
  rowCount: number;
  data: SyncRun[];
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handleFilters: (newFilterParams?: SyncRunFilterParams[]) => void;
};

const equalOperatorOnly = getGridStringOperators().filter((operator) => operator.value === 'equals');

const SUPPORTED_OPERATORS = ['after', 'before'];
const supportedDateOperators = getGridDateOperators(true).filter((operator) =>
  SUPPORTED_OPERATORS.includes(operator.value)
);

export default function SyncRunsTable(props: SyncRunsTableProps) {
  const { data, rowCount, handleNextPage, handlePreviousPage, isLoading, handleFilters } = props;
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: SYNC_RUNS_PAGE_SIZE,
  });

  const { entities = [] } = useEntities();

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
      field: 'type',
      headerName: 'Type',
      width: 100,
      sortable: false,
      filterable: false,
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
      field: 'entityId',
      headerName: 'EntityId',
      valueGetter: (params) =>
        params.row.entityId
          ? entities.find((entity) => entity.id === params.row.entityId)?.name ?? params.row.entityId
          : '',
      width: 120,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      sortable: false,
      filterable: true,
      filterOperators: equalOperatorOnly,
    },
    {
      field: 'startTimestamp',
      headerName: 'Start Time',
      width: 160,
      valueFormatter: ({ value }) => (value ? datetimeStringFromISOString(value) : '-'),
      sortable: false,
      filterable: true,
      filterOperators: supportedDateOperators,
    },
    {
      field: 'endTimestamp',
      headerName: 'End Time',
      width: 160,
      valueFormatter: ({ value }) => (value ? datetimeStringFromISOString(value) : '-'),
      sortable: false,
      filterable: true,
      filterOperators: supportedDateOperators,
    },
    {
      field: 'numRecordsSynced',
      headerName: '# Synced',
      width: 90,
      sortable: false,
      filterable: false,
    },
    {
      field: 'errorMessage',
      headerName: 'Error Message',
      width: 240,
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div style={{ height: 750, width: '100%' }}>
      <DataGridPro
        density="compact"
        disableDensitySelector
        pageSizeOptions={[SYNC_RUNS_PAGE_SIZE]}
        filterMode="server"
        onFilterModelChange={(model) => {
          if (model.items.length === 0) {
            handleFilters(undefined);
            return;
          }
          const filters = model.items
            .map(({ field, operator, value }) => {
              if (operator === 'equals') {
                return {
                  filterBy: field as SyncRunFilterBy,
                  value: value as string,
                };
              }
              if (operator === 'after' && value) {
                return {
                  filterBy: field as SyncRunFilterBy,
                  value: `>${attachTimezone(value)}`,
                };
              }
              if (operator === 'before' && value) {
                return {
                  filterBy: field as SyncRunFilterBy,
                  value: `<${attachTimezone(value)}`,
                };
              }
              return {
                filterBy: field as SyncRunFilterBy,
                value: undefined,
              };
            })
            .filter(({ value }) => !!value);
          handleFilters(filters as SyncRunFilterParams[]);
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
            sortModel: [{ field: 'cuid', sort: 'desc' }],
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

function attachTimezone(timestamp: string): string {
  const currentOffsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(currentOffsetMinutes / 60));
  const offsetMinutes = Math.abs(currentOffsetMinutes % 60);

  // Format the offset. For instance, if the offset is 330 minutes (5 hours and 30 minutes ahead of UTC),
  // it should return "+05:30".
  const formattedOffset =
    (currentOffsetMinutes > 0 ? '-' : '+') +
    String(offsetHours).padStart(2, '0') +
    ':' +
    String(offsetMinutes).padStart(2, '0');

  return `${timestamp}${formattedOffset}`;
}
