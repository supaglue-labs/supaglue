import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useCustomers() {
  const { data, error, isLoading } = useSWR(`/api/internal/customers`, fetcher);

  return {
    customers: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
