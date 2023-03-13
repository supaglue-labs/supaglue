import { API_HOST, APPLICATION_ID } from '@/client';
import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useIntegrations() {
  const { data, error, isLoading, ...rest } = useSWR(
    `${API_HOST}/mgmt/v1/applications/${APPLICATION_ID}/integrations`,
    fetcher
  );

  return {
    integrations: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
    ...rest,
  };
}
