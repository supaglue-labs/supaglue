import type { Destination as DestinationModel } from '@supaglue/db';
import { Destination } from '@supaglue/types';

export const fromDestinationModel = (model: DestinationModel): Destination => {
  return {
    id: model.id,
    name: model.name,
    type: model.type,
    applicationId: model.applicationId,
    config: model.config,
  } as Destination; // TODO: better type safety?
};
