import { Box } from '@mui/material';
import { AppPortal } from 'svix-react';

import 'svix-react/style.css';
export default function WebhookTabPanel({ svixDashboardUrl }: { svixDashboardUrl: string }) {
  return (
    <Box
      sx={{
        padding: 6,
        flexGrow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        height: 'full',
        borderRadius: '0',
      }}
      component={AppPortal}
      url={svixDashboardUrl}
      fullSize
    ></Box>
  );
}
