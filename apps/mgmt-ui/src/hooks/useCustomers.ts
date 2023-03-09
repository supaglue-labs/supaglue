import useSWR from 'swr';
import { API_HOST, fetcher } from '.';

export function useCustomers() {
  const { data, error, isLoading } = useSWR(`${API_HOST}/mgmt/v1/customers`, fetcher);

  return {
    customers: data,
    isLoading,
    isError: error,
  };
}
