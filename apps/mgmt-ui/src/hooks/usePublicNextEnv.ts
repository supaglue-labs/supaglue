import type { SupagluePublicNextEnv } from '@/pages/api/internal/env';
import useSWR from 'swr';
import { fetcher } from '.';

export function usePublicNextEnv() {
  const { data, error, isLoading, ...rest } = useSWR(`/api/internal/env`, fetcher<SupagluePublicNextEnv>);

  return {
    publicNextEnv: data,
    isLoading,
    error,
    ...rest,
  };
}
