import { camelcaseKeys } from '@/utils/camelcase';
import { Application } from '@supaglue/core/types/application';
import useSWR from 'swr';
import { fetcher } from '.';

export function useApplications() {
  const { data, error, isLoading, ...rest } = useSWR(`/api/internal/applications`, fetcher<Application[]>);

  return {
    applications: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
