import { CustomerExpandedSafe } from '@supaglue/types/customer';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useCustomers() {
  const { data, ...rest } = useSWRWithApplication<CustomerExpandedSafe[]>('/api/internal/customers');

  return {
    customers: data ? camelcaseKeys(data) : undefined,
    ...rest,
  };
}
