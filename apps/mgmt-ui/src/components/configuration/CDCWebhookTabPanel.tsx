/* eslint-disable @typescript-eslint/no-floating-promises */

import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { Box, Button, Stack, Typography } from '@mui/material';

export default function CDCWebhookTabPanel({ svixDashboardUrl }: { svixDashboardUrl: string }) {
  const CDCWebhookApplicationWhitelist: string[] = [];
  const activeApplicationId = useActiveApplicationId();
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
        {CDCWebhookApplicationWhitelist.includes(activeApplicationId) ? (
          <iframe
            src={svixDashboardUrl}
            className="h-full border-0 w-full"
            allow="clipboard-write"
            loading="lazy"
          ></iframe>
        ) : (
          <Stack>
            <Box>
              <Typography variant="h5">Real-time events</Typography>
            </Box>
            <Box>
              <Typography variant="body1">
                Real-time Events lets you subscribe to a webhook and consume change data capture (CDC) events from your
                customers' CRMs.
              </Typography>
            </Box>

            <Box>
              <Box fontSize="2.4rem">
                <Button variant="contained" color="primary" href="https://m8ndtm64l4g.typeform.com/to/ovOUDxGj">
                  Get Early Access
                </Button>
              </Box>
            </Box>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
