import type { DestinationSafeAny } from '@supaglue/types';
import { SUPAGLUE_MANAGED_DESTINATION } from '@supaglue/utils';

export const getDestinationName = (destination: DestinationSafeAny): string => {
  if (destination.type === 'supaglue') {
    return SUPAGLUE_MANAGED_DESTINATION;
  }
  return destination.name;
};
