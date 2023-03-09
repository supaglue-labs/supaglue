import Header from '@/layout/Header';
import { Box, Divider, Tab, Tabs, Typography } from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';
import ConfigurationTabs from '../../components/configuration/VerticalTabs';

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Head>
        <title>Supaglue Management UI</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          tabs={
            <Tabs value={0} textColor="inherit">
              <Tab label="Connectors" />
              <Tab label="API Keys" />
            </Tabs>
          }
          title="Configuration"
          onDrawerToggle={handleDrawerToggle}
        />
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <Typography variant="h6">Overview</Typography>
          <Typography variant="subtitle2">List of connectors that have been added.</Typography>
          <Divider className="my-4" />
          <ConfigurationTabs />
        </Box>
      </Box>
    </>
  );
}
