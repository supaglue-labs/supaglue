import type { ListStandardObjectsSuccessfulResponse } from '@supaglue/schemas/v2/metadata';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useStandardObjects(customerId: string, providerName: string) {
  const { data, ...rest } = useSWRWithApplication<ListStandardObjectsSuccessfulResponse>(
    `/api/internal/metadata/objects/standard?customer_id=${customerId}&provider_name=${providerName}`
  );

  return {
    data,
    ...rest,
  };
}
