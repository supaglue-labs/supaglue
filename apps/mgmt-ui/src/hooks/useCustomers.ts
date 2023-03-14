import { API_HOST, APPLICATION_ID } from '@/client';
import useSWR from 'swr';
import { fetcher } from '.';

export function useCustomers() {
  const { data, error, isLoading } = useSWR(`${API_HOST}/mgmt/v1/applications/${APPLICATION_ID}/customers`, fetcher);

  return {
    customers: [], //data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
