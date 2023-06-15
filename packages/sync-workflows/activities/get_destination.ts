import { DestinationService } from '@supaglue/core/services/destination_service';
import { Destination } from '@supaglue/types';

export type GetDestinationArgs = {
  syncId: string;
};

export type GetDestinationResult = {
  destination: Destination | null;
};

export function createGetDestination(destinationService: DestinationService) {
  return async function getDestination({ syncId }: GetDestinationArgs): Promise<GetDestinationResult> {
    const destination = await destinationService.getDestinationBySyncId(syncId);
    return { destination };
  };
}
