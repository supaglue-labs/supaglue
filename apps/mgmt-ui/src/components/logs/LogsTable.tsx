import { relativeDateFromISOString } from '@/utils/datetime';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { SyncHistory } from '@supaglue/core/types';

const columns: GridColDef[] = [
  { field: 'providerName', headerName: 'Provider', width: 150 },
  { field: 'model', headerName: 'Model', width: 150 },
  { field: 'status', headerName: 'Status', width: 150 },
  {
    field: 'startTimestamp',
    headerName: 'Start Time',
    width: 240,
    valueGetter: ({ value }) => relativeDateFromISOString(value),
  },
  {
    field: 'endTimestamp',
    headerName: 'End Time',
    width: 240,
    valueGetter: ({ value }) => relativeDateFromISOString(value),
  },
  {
    field: 'errorMessage',
    headerName: 'Error Message',
    width: 90,
  },
];

export type LogsTableProps = {
  data: SyncHistory[];
};

export default function LogsTable(props: LogsTableProps) {
  const { data } = props;

  return (
    <div style={{ height: 750, width: '100%' }}>
      <DataGrid rows={data ?? []} columns={columns} />
    </div>
  );
}
