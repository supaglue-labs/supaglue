import LogsTable from '@/components/logs/LogsTable';
import ModelSelect from '@/components/logs/ModelSelect';
import { useSyncHistory } from '@/hooks/useSyncHistory';
import Header from '@/layout/Header';
import { Box, Divider, Grid, Typography } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const { syncHistory = { results: [] } } = useSyncHistory();
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
        <Header title="Sync Logs" onDrawerToggle={handleDrawerToggle} />
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <Typography variant="h6">Overview</Typography>
          <Typography variant="subtitle2">Logs of syncs running for your customers.</Typography>

          <Grid className="my-4 gap-2" container direction="row" justifyContent="start" alignItems="center">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Start date"
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
              <DateTimePicker
                label="End date"
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </LocalizationProvider>

            <ModelSelect />
          </Grid>

          <Divider className="my-4" />
          <LogsTable data={syncHistory.results} />
        </Box>
      </Box>
    </>
  );
}
