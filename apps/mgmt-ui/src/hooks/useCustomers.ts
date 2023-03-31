import { CustomerExpandedSafe } from '@supaglue/types/customer';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useCustomers() {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<CustomerExpandedSafe[]>('/api/internal/customers');

  return {
    customers: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
