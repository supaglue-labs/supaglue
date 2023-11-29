import type { ListPropertiesSuccessfulResponse } from '@supaglue/schemas/v2/crm';
import type { ObjectType } from '@supaglue/types/sync';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useProperties(customerId: string, providerName: string, type: ObjectType, name: string) {
  const { data, ...rest } = useSWRWithApplication<ListPropertiesSuccessfulResponse>(
    `/api/internal/properties?customer_id=${customerId}&provider_name=${providerName}&type=${type}&name=${name}`
  );

  return {
    properties: data?.properties,
    ...rest,
  };
}
