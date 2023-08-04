import type { ListStandardObjectsResponse } from '@supaglue/schemas/v2/metadata';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useStandardObjects(customerId: string, providerName: string) {
  const { data, ...rest } = useSWRWithApplication<ListStandardObjectsResponse>(
    `/api/internal/metadata/objects/standard?customer_id=${customerId}&provider_name=${providerName}`
  );

  return {
    data,
    ...rest,
  };
}
