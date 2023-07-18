import { createCustomer, deleteCustomer } from '@/client';
import { DeleteCustomer } from '@/components/customers/DeleteCustomer';
import { NewCustomer } from '@/components/customers/NewCustomer';
import MetricCard from '@/components/MetricCard';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useCustomers } from '@/hooks/useCustomers';
import { useNextLambdaEnv } from '@/hooks/useNextLambdaEnv';
import { useProviders } from '@/hooks/useProviders';
import Header from '@/layout/Header';
import { getServerSideProps } from '@/pages/applications/[applicationId]';
import providerToIcon from '@/utils/providerToIcon';
import { PeopleAltOutlined } from '@mui/icons-material';
import LinkIcon from '@mui/icons-material/Link';
import { Box, Breadcrumbs, Grid, IconButton, Stack, Typography } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import type { ConnectionSafeAny } from '@supaglue/types';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export { getServerSideProps };

export default function Home() {
  const { nextLambdaEnv } = useNextLambdaEnv();
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const router = useRouter();
  const returnUrl = `${origin}${router.asPath}`;
  const { addNotification } = useNotification();
  const { customers = [], isLoading, mutate } = useCustomers();
  const [mobileOpen, setMobileOpen] = useState(false);
  const applicationId = useActiveApplicationId();

  const onCreateCustomer = async (customerId: string, name: string, email: string) => {
    const response = await createCustomer(applicationId, customerId, name, email);
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    addNotification({ message: 'Successfully added customer', severity: 'success' });
    await mutate([...customers, { applicationId, customerId, name, email, connections: [] }], false);
  };

  // TODO: count this on server?
  const totalConnections = customers
    ?.map((customer) => customer.connections.length)
    .reduce((a: number, b: number) => a + b, 0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEmbedLinkClick = async (params: GridRenderCellParams) => {
    addNotification({ message: 'Copied to clipboard', severity: 'success' });

    await navigator.clipboard.writeText(
      `${nextLambdaEnv?.API_HOST}/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
        params.id
      )}&returnUrl=${returnUrl}&providerName={{REPLACE_ME}}`
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 300,
      renderCell: (params) => {
        return <span className="whitespace-normal">{params.row.id}</span>;
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
      renderCell: (params) => {
        return <span className="whitespace-normal">{params.row.name}</span>;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      renderCell: (params) => {
        return <span className="whitespace-normal">{params.row.email}</span>;
      },
    },
    {
      field: 'connections',
      headerName: 'Connections',
      width: 150,
      renderCell: (params) => {
        if (params.value.length === 0) {
          return <div>--</div>;
        }

        return (
          <Link href={`/applications/${applicationId}/customers/${encodeURIComponent(params.id)}/connections`}>
            {params.value.map((connection: ConnectionSafeAny) => providerToIcon(connection.providerName))}
          </Link>
        );
      },
    },
    {
      field: 'link',
      headerName: 'Embed Link',
      width: 100,
      renderCell: (params) => {
        return <EmbedLinkMenu customerId={params.id as string} />;
      },
    },
    {
      field: '_',
      headerName: 'Admin',
      width: 100,
      renderCell: (params) => {
        return (
          <DeleteCustomer
            disabled={params.row.connections.length > 0}
            customerId={params.row.id}
            onDelete={async () => {
              const response = await deleteCustomer(applicationId, params.row.id);
              if (!response.ok) {
                addNotification({ message: response.errorMessage, severity: 'error' });
                return;
              }
              addNotification({ message: 'Successfully removed customer', severity: 'success' });
              await mutate(
                customers.filter((customer) => customer.customerId !== params.row.id),
                false
              );
            }}
          />
        );
      },
    },
  ];

  const rows = customers.map((customer) => ({
    id: customer.customerId,
    email: customer.email,
    name: customer.name,
    connections: customer?.connections,
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
          {isLoading ? (
            <Spinner />
          ) : (
            <Stack className="gap-2">
              <Breadcrumbs>
                <Link color="inherit" href={`/applications/${applicationId}`}>
                  Home
                </Link>
                <Typography color="text.primary">Customers</Typography>
              </Breadcrumbs>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricCard
                    icon={<PeopleAltOutlined />}
                    value={
                      <Stack direction="row" className="align-center justify-center justify-between">
                        <div>{customers.length} customers</div>
                        <NewCustomer onCreate={onCreateCustomer} />
                      </Stack>
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricCard icon={<LinkIcon />} value={`${totalConnections} connections`} />
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
          )}
        </Box>
      </Box>
    </>
  );
}

function EmbedLinkMenu({ customerId }: { customerId: string }) {
  const { nextLambdaEnv } = useNextLambdaEnv();
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const router = useRouter();
  const returnUrl = `${origin}${router.asPath}`;
  const { addNotification } = useNotification();
  const applicationId = useActiveApplicationId();

  const { providers = [] } = useProviders();

  const handleEmbedLinkClick = async (providerName: string) => {
    addNotification({ message: 'Copied to clipboard', severity: 'success' });
    await navigator.clipboard.writeText(
      `${nextLambdaEnv?.API_HOST}/oauth/connect?applicationId=${applicationId}&customerId=${encodeURIComponent(
        customerId
      )}&returnUrl=${returnUrl}&providerName=${providerName}`
    );
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <LinkIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {providers.map(({ name: providerName }) => (
          <MenuItem
            key={providerName}
            onClick={async () => {
              await handleEmbedLinkClick(providerName);
              handleClose();
            }}
          >
            {providerName}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
