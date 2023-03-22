import MetricCard from '@/components/customers/MetricCard';
import { useCustomers } from '@/hooks/useCustomers';
import Header from '@/layout/Header';
import { Link, PeopleAltOutlined } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { type GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { API_HOST, SG_INTERNAL_TOKEN } from './api';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  console.log(`calling getServerSideProps`);
  // This is the same call as in apps/mgmt-ui/src/pages/api/internal/applications/index.ts
  // Get applications to set active application
  const result = await fetch(`${API_HOST}/internal/v1/applications`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
    },
  });

  if (!result.ok) {
    throw new Error('Errored while fetching applications');
  }

  const applications = await result.json();

  // Pick one application at random
  // TODO: Make it not random
  if (!applications.length) {
    throw new Error('No applications found');
  }

  return {
    props: { activeApplication: applications[0] },
  };
};

export default function Home() {
  const { customers = [] } = useCustomers();
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalConnections = customers
    ?.map((customer) => customer.connections.length)
    .reduce((a: number, b: number) => a + b, 0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Head>
        <title>Supaglue Management Portal</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Dashboard" onDrawerToggle={handleDrawerToggle} />
        <Box className="space-y-4" component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <MetricCard icon={<PeopleAltOutlined />} value={`${customers.length} customers`} />
            </Grid>
            <Grid item xs={6}>
              <MetricCard icon={<Link />} value={`${totalConnections} connections`} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
