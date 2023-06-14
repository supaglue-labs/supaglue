import useSWR from 'swr';
import { fetcher } from '.';

export function useNextLambdaEnv() {
  const { data, error, isLoading, ...rest } = useSWR(
    `/api/internal/env`,
    fetcher<{ API_HOST: string; IS_CLOUD: boolean }>
  );

  return {
    nextLambdaEnv: data,
    isLoading,
    error,
    ...rest,
  };
}
