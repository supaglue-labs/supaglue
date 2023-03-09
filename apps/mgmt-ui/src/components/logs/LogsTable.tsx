import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'model', headerName: 'Model', width: 150 },
  { field: 'status', headerName: 'Status', width: 150 },
  { field: 'start_timestamp', headerName: 'Start Time', width: 240 },
  { field: 'end_timestamp', headerName: 'End Time', width: 240 },

  {
    field: 'error_message',
    headerName: 'Error Message',
    width: 90,
  },
  //   {
  //     field: "customer-id",
  //     headerName: "Customer ID",
  //     width: 160,
  //   },
];

export type LogsTableProps = {
  data: any[]; // TODO: get type from monorepo
};

export default function LogsTable(props: LogsTableProps) {
  const { data } = props;

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={data ?? []} columns={columns} pageSizeOptions={[5]} />
    </div>
  );
}
