import Spinner from '@/components/Spinner';
import { Grid } from '@mui/material';
import { Destination } from '@supaglue/types';
import DestinationCard from './DestinationCard';
import { DestinationCardInfo } from './DestinationTabPanelContainer';

export type DestinationsListPanelProps = {
  destinationCardsInfo: DestinationCardInfo[];
  existingDestinations: Destination[];
  isLoading: boolean;
};

export default function DestinationsListPanel(props: DestinationsListPanelProps) {
  const { destinationCardsInfo, existingDestinations, isLoading } = props;

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Grid container spacing={2}>
      {destinationCardsInfo.map((info) => {
        const existingDestination = existingDestinations.find(
          (destination: Destination) => info.type === destination.type
        );

        return (
          <Grid key={info.name} item xs={6}>
            <DestinationCard destination={existingDestination} destinationInfo={info} />
          </Grid>
        );
      })}
    </Grid>
  );
}
