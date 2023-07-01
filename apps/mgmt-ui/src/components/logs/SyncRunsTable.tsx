import { datetimeStringFromISOString } from '@/utils/datetime';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { ObjectSyncRun } from '@supaglue/types/object_sync_run';
import { useState } from 'react';

const columns: GridColDef[] = [
  { field: 'customerId', headerName: 'Customer Id', width: 200, sortable: false },
  { field: 'providerName', headerName: 'Provider', width: 120, sortable: false },
  { field: 'objectType', headerName: 'Object Type', width: 120, sortable: false },
  { field: 'object', headerName: 'Object', width: 120, sortable: false },
  { field: 'status', headerName: 'Status', width: 100, sortable: false },
  {
    field: 'startTimestamp',
    headerName: 'Start Time',
    width: 160,
    valueFormatter: ({ value }) => (value ? datetimeStringFromISOString(value) : '-'),
    sortable: false,
  },
  {
    field: 'endTimestamp',
    headerName: 'End Time',
    width: 160,
    valueFormatter: ({ value }) => (value ? datetimeStringFromISOString(value) : '-'),
    sortable: false,
  },
  {
    field: 'numRecordsSynced',
    headerName: '# Synced',
    width: 90,
    sortable: false,
  },
  {
    field: 'errorMessage',
    headerName: 'Error Message',
    width: 240,
    sortable: false,
  },
];

export type SyncRunsTableProps = {
  isLoading: boolean;
  rowCount: number;
  data: ObjectSyncRun[];
  handleNextPage: () => void;
  handlePreviousPage: () => void;
};

export default function SyncRunsTable(props: SyncRunsTableProps) {
  const { data, rowCount, handleNextPage, handlePreviousPage, isLoading } = props;
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 100,
  });

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
            sortModel: [{ field: 'startTimestamp', sort: 'desc' }],
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
