import { Application } from '@supaglue/types/application';
import useSWR from 'swr';
import { fetcher } from '.';

export function useApplications() {
  const { data, error, isLoading, ...rest } = useSWR(`/api/internal/applications`, fetcher<Application[]>);

  return {
    applications: data,
    isLoading,
    error,
    ...rest,
  };
}
