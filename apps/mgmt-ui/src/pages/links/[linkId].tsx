import { useLinkId } from '@/hooks/useLinkId';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { GetServerSideProps } from 'next';
import { useState } from 'react';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: { session: null, signedIn: false },
  };
};

export default function Home() {
  const linkId = useLinkId();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <Stack>
            <Box>
              <Typography variant="h5">Welcome to the Supaglue Management Portal!</Typography>
            </Box>
            <Box>
              <Typography variant="body1">
                Learn how to sync your customers's data to your database using our guide below.
              </Typography>
            </Box>

            <Box>
              <Box fontSize="2.4rem">
                👉{' '}
                <Button variant="contained" color="primary" href="https://docs.supaglue.com/quickstart">
                  Quickstart Guide
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
