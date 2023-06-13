import { DestinationService } from '@supaglue/core/services/destination_service';
import { Destination } from '@supaglue/types';

export type GetDestinationArgs = {
  syncId: string;
};

export type GetdestinationResult = {
  destination: Destination | null;
};

export function createGetDestination(destinationService: DestinationService) {
  return async function getDestination({ syncId }: GetDestinationArgs): Promise<GetdestinationResult> {
    const destination = await destinationService.getDestinationBySyncId(syncId);
    return { destination };
  };
}
