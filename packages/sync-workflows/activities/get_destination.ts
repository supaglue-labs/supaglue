import { DestinationService } from '@supaglue/core/services/destination_service';
import { Destination } from '@supaglue/types';

export type GetDestinationArgs = {
  connectionId: string;
};

export type GetdestinationResult = {
  destination: Destination | null;
};

export function createGetDestination(destinationService: DestinationService) {
  return async function getDestination({ connectionId }: GetDestinationArgs): Promise<GetdestinationResult> {
    const destination = await destinationService.getDestinationByConnectionId(connectionId);
    return { destination };
  };
}
