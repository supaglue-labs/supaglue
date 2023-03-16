import MetricCard from '@/components/customers/MetricCard';
import { useCustomers } from '@/hooks/useCustomers';
import Header from '@/layout/Header';
import { getServerSideProps } from '@/pages';
import providerToIcon from '@/utils/providerToIcon';
import { Link, PeopleAltOutlined } from '@mui/icons-material';
import { Box, Grid, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Head from 'next/head';
import { useState } from 'react';

export { getServerSideProps };

export default function Home() {
  const { customers = [] } = useCustomers();
  // const { syncHistory = [] } = useSyncHistory();
  const [mobileOpen, setMobileOpen] = useState(false);

  // TODO: count this on server?
  const totalConnections = customers
    ?.map((customer: any /* TODO: @supaglue/core/types */) => customer.connections.length)
    .reduce((a: number, b: number) => a + b, 0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // const columns: GridColDef[] = [
  //   { field: 'id', headerName: 'ID', width: 300 },
  //   { field: 'name', headerName: 'Name', width: 250 },
  //   { field: 'email', headerName: 'Email', width: 250 },
  //   {
  //     field: 'connections',
  //     headerName: 'Connections',
  //     width: 300,
  //     renderCell: (params) => {
  //       return providerToIcon(params.value);
  //     },
  //   },
  // ];

  // const rows = customers.map((customer: any) => ({
  //   id: customer.id,
  //   email: customer.email,
  //   name: customer.name,
  //   connections: customer?.connections[0]?.providerName, // todo: show all connections
  // }));

  // const columns: GridColDef[] = [
  //   { field: 'id', headerName: 'ID', width: 300 },
  //   { field: 'name', headerName: 'Name', width: 250 },
  //   { field: 'email', headerName: 'Email', width: 250 },
  //   {
  //     field: 'connections',
  //     headerName: 'Connections',
  //     width: 300,
  //     renderCell: (params) => {
  //       <>
  //         {params.value.map((connection: any) => (
  //           <span key={connection?.providerName}>{providerToIcon(connection.providerName)}</span>
  //         ))}
  //       </>;
  //     },
  //   },
  // ];

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 300 },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'connections',
      headerName: 'Connections',
      width: 300,
      renderCell: (params) => {
        return params.value.map((connection: any) => providerToIcon(connection.providerName));
      },
    },
  ];

  const rows = customers.map((customer: any) => ({
    id: customer.id,
    email: customer.email,
    name: customer.name,
    connections: customer?.connections, // include the entire connections array
  }));
  return (
    <>
      <Head>
        <title>Supaglue Management Portal</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Customers" onDrawerToggle={handleDrawerToggle} />
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <Stack className="gap-2">
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <MetricCard icon={<PeopleAltOutlined />} value={`${customers.length} customers`} />
              </Grid>
              {/* <Grid item xs={4}>
              <MetricCard icon={<CloudUploadOutlined />} value={`${syncHistory.length} syncs`} />
            </Grid> */}
              <Grid item xs={6}>
                <MetricCard icon={<Link />} value={`${totalConnections} connections`} />
              </Grid>
            </Grid>

            <div style={{ height: '100%', width: '100%' }}>
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
          </Stack>
        </Box>
      </Box>
    </>
  );
}
