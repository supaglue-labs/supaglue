/* eslint-disable @typescript-eslint/no-floating-promises */

import { Box, Stack } from '@mui/material';

export default function CDCWebhookTabPanel({ svixDashboardUrl }: { svixDashboardUrl: string }) {
  return (
    <Box
      sx={{
        padding: 6,
        flexGrow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        height: 'full',
      }}
    >
      <Stack direction="column" className="gap-4 w-full h-screen">
        <iframe
          src={svixDashboardUrl}
          className="h-full border-0 w-full"
          allow="clipboard-write"
          loading="lazy"
        ></iframe>
      </Stack>
    </Box>
  );
}
