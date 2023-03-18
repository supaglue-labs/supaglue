import { camelcaseKeys } from '@/utils/camelcase';
import { CustomerExpandedSafe } from '@supaglue/core/types/customer';
import useSWR from 'swr';
import { fetcher } from '.';

export function useCustomers() {
  const { data, error, isLoading } = useSWR(`/api/internal/customers`, fetcher<CustomerExpandedSafe[]>);

  return {
    customers: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
