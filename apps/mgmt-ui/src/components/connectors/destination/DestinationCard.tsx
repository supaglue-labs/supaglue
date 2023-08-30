/* eslint-disable @typescript-eslint/no-floating-promises */
import { createDestination } from '@/client';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useDestinations } from '@/hooks/useDestinations';
import { Button, Card, CardContent, CardHeader, Divider, Grid, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import type { DestinationSafeAny } from '@supaglue/types';
import { useRouter } from 'next/router';
import type { DestinationCardInfo } from './DestinationTabPanelContainer';

export default function DestinationCard({
  destination,
  destinationInfo,
}: {
  destination?: DestinationSafeAny;
  destinationInfo: DestinationCardInfo;
}) {
  const router = useRouter();
  const applicationId = useActiveApplicationId();
  const { addNotification } = useNotification();
  const { destinations: existingDestinations = [], mutate } = useDestinations();

  const createSupaglueDestination = async (): Promise<DestinationSafeAny | undefined> => {
    const response = await createDestination({
      applicationId,
      type: 'supaglue',
    });
    if (!response.ok) {
      addNotification({ message: response.errorMessage, severity: 'error' });
      return;
    }
    addNotification({ message: 'Successfully enabled Supaglue managed destination', severity: 'success' });
    return response.data;
  };

  const { icon, name, description, type } = destinationInfo;

  return (
    <Card
      classes={{
        root: 'h-48 justify-between flex flex-col overflow-y-hidden',
      }}
    >
      <Box>
        <CardHeader
          avatar={icon}
          subheader={
            <Stack direction="row" className="justify-between">
              <Stack direction="column">
                <Typography>{name}</Typography>
              </Stack>
              <Typography color={destination ? '#22c55e' : undefined}>
                {destination ? 'Connected' : 'Not Connected'}
              </Typography>
            </Stack>
          }
        />
        <CardContent
          classes={{
            root: 'text-sm h-[5rem] text-ellipsis overflow-hidden',
          }}
        >
          {description}
        </CardContent>
      </Box>
      <Box>
        <Divider />
        <Grid container justifyContent="flex-end">
          {type === 'supaglue' && !destination && (
            <Button
              variant="text"
              onClick={async () => {
                const newDestination = await createSupaglueDestination();
                if (!newDestination) {
                  return;
                }
                const latestDestinations = [...existingDestinations, newDestination];
                mutate(latestDestinations, {
                  optimisticData: latestDestinations,
                  revalidate: false,
                  populateCache: false,
                });
              }}
            >
              Enable
            </Button>
          )}
          {type !== 'supaglue' && (
            <Button
              variant="text"
              onClick={() => {
                router.push(`/applications/${applicationId}/connectors/destinations/${type}`);
              }}
            >
              Configure
            </Button>
          )}
        </Grid>
      </Box>
    </Card>
  );
}
