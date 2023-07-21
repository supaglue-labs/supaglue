import type { ConnectionSafeAny } from '@supaglue/types/connection';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useConnection(customerId: string, connectionId: string) {
  const { data, ...rest } = useSWRWithApplication<ConnectionSafeAny>(
    `/api/internal/customers/${encodeURIComponent(customerId)}/connections/${connectionId}`
  );

  return {
    connections: data ? camelcaseKeys(data) : undefined,
    customerId,
    ...rest,
  };
}
