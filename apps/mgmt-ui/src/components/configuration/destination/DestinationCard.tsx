/* eslint-disable @typescript-eslint/no-floating-promises */
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { Button, Card, CardContent, CardHeader, Divider, Grid, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import type { Destination } from '@supaglue/types';
import { useRouter } from 'next/router';
import type { DestinationCardInfo } from './DestinationTabPanelContainer';

export default function DestinationCard({
  destination,
  destinationInfo,
}: {
  destination?: Destination;
  destinationInfo: DestinationCardInfo;
}) {
  const router = useRouter();
  const applicationId = useActiveApplicationId();

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
          <Button
            variant="text"
            onClick={() => {
              router.push(`/applications/${applicationId}/configuration/destinations/${type}`);
            }}
          >
            Configure
          </Button>
        </Grid>
      </Box>
    </Card>
  );
}
