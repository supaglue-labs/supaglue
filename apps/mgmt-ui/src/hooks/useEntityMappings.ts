import type { ListEntityMappingsSuccessfulResponse } from '@supaglue/schemas/v2/mgmt';
import type { MergedEntityMapping } from '@supaglue/types/entity_mapping';
import { snakecaseKeys } from '@supaglue/utils';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useEntityMappings(customerId: string, providerName: string) {
  const { data, ...rest } = useSWRWithApplication<ListEntityMappingsSuccessfulResponse>(
    `/api/internal/entity-mappings?customer_id=${customerId}&provider_name=${providerName}`
  );

  return {
    entityMappings: data?.map(camelcaseKeys),
    ...rest,
  };
}

export const toListEntityMappingsResponse = (
  mergedEntityMappings: MergedEntityMapping[]
): ListEntityMappingsSuccessfulResponse => {
  return mergedEntityMappings.map(snakecaseKeys);
};
