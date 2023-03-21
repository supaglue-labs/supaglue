import { camelcaseKeys } from '@/utils/camelcase';
import { CustomerExpandedSafe } from '@supaglue/core/types/customer';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useCustomers() {
  const { data, isLoading, error } = useSWRWithApplication<CustomerExpandedSafe[]>('/api/internal/customers');

  return {
    customers: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
  };
}
