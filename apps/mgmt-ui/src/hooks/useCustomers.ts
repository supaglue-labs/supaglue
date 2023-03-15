import { API_HOST } from '@/client';
import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useCustomers() {
  const { data, error, isLoading } = useSWR(`${API_HOST}/internal/v1/customers`, fetcher);

  return {
    customers: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
