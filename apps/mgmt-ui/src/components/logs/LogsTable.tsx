import { datetimeStringFromISOString } from '@/utils/datetime';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { SyncHistory } from '@supaglue/types';

const columns: GridColDef[] = [
  { field: 'customerId', headerName: 'Customer Id', width: 200 },
  { field: 'providerName', headerName: 'Provider', width: 120 },
  { field: 'modelName', headerName: 'Model', width: 120 },
  { field: 'status', headerName: 'Status', width: 120 },
  {
    field: 'startTimestamp',
    headerName: 'Start Time',
    width: 180,
    valueGetter: ({ value }) => (value ? datetimeStringFromISOString(value) : '-'),
  },
  {
    field: 'endTimestamp',
    headerName: 'End Time',
    width: 180,
    valueGetter: ({ value }) => (value ? datetimeStringFromISOString(value) : '-'),
  },
  {
    field: 'errorMessage',
    headerName: 'Error Message',
    width: 240,
  },
];

export type LogsTableProps = {
  data: SyncHistory[];
};

export default function LogsTable(props: LogsTableProps) {
  const { data } = props;

  return (
    <div style={{ height: 750, width: '100%' }}>
      <DataGrid
        rows={data ?? []}
        columns={columns}
        sx={{
          boxShadow: 1,
          backgroundColor: 'white',
        }}
      />
    </div>
  );
}
