import { API_HOST, APPLICATION_ID } from '@/client';
import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useIntegration(integrationId: string) {
  const { data, error, isLoading, ...rest } = useSWR(
    `${API_HOST}/mgmt/v1/applications/${APPLICATION_ID}/integrations/${integrationId}`,
    fetcher
  );

  return {
    integration: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
    ...rest,
  };
}
