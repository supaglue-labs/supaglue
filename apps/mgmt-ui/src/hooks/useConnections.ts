import { ConnectionSafeAnyWithIsSyncEnabled } from '@supaglue/types/connection';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useConnections(customerId: string) {
  const { data, ...rest } = useSWRWithApplication<ConnectionSafeAnyWithIsSyncEnabled[]>(
    `/api/internal/customers/${encodeURIComponent(customerId)}/connections`
  );

  return {
    connections: data ? camelcaseKeys(data) : undefined,
    customerId,
    ...rest,
  };
}
