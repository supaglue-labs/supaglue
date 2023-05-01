import useSWR from 'swr';
import { fetcher } from '.';

export function useNextLambdaEnv() {
  const { data, error, isLoading, ...rest } = useSWR(`/api/internal/env`, fetcher<{ API_HOST: string }>);

  if (!data?.API_HOST) {
    throw new Error('API_HOST is not defined');
  }

  return {
    nextLambdaEnv: data,
    isLoading,
    error,
    ...rest,
  };
}
