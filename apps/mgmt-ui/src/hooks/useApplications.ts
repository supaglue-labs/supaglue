import type { Application } from '@supaglue/types/application';
import useSWR from 'swr';
import { fetcher } from '.';

export function useApplications() {
  const { data, ...rest } = useSWR(`/api/internal/applications`, fetcher<Application[]>);

  return {
    applications: data ? data : [], // this can somehow be null, so we need to handle that
    ...rest,
  };
}
