import type { ListCustomObjectsResponse } from '@supaglue/schemas/v2/metadata';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useCustomObjects(customerId: string, providerName: string) {
  const { data, ...rest } = useSWRWithApplication<ListCustomObjectsResponse>(
    `/api/internal/metadata/objects/custom?customer_id=${customerId}&provider_name=${providerName}`
  );

  return {
    data,
    ...rest,
  };
}
