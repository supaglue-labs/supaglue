import type { ListEntityMappingsResponse } from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useEntityMappings(customerId: string, providerName: string) {
  const { data, ...rest } = useSWRWithApplication<ListEntityMappingsResponse>(
    `/api/internal/entity-mappings?customer_id=${customerId}&provider_name=${providerName}`
  );

  return {
    entityMappings: data?.map(camelcaseKeys),
    ...rest,
  };
}
