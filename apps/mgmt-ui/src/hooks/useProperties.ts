import type { ListPropertiesResponse } from '@supaglue/schemas/v2/mgmt';
import type { ObjectType } from '@supaglue/types/sync';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useProperties(customerId: string, providerName: string, objectType: ObjectType, object: string) {
  const { data, ...rest } = useSWRWithApplication<ListPropertiesResponse>(
    `/api/internal/properties?customer_id=${customerId}&provider_name=${providerName}&type=${objectType}&name=${object}`
  );

  return {
    properties: data?.properties,
    ...rest,
  };
}
