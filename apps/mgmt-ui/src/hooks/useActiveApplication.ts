import type { Application } from '@supaglue/types/application';
import useSWR from 'swr';
import { fetcher } from '.';
import { useActiveApplicationId } from './useActiveApplicationId';

export function useActiveApplication() {
  let applicationId: string;
  try {
    applicationId = useActiveApplicationId();
  } catch (e) {
    return {
      activeApplication: undefined,
      isLoading: false,
      error: undefined,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mutate: () => {},
      isValidating: false,
    };
  }

  const { data, error, isLoading, ...rest } = useSWR(
    `/api/internal/applications/${applicationId}`,
    fetcher<Application>
  );

  return {
    activeApplication: data,
    isLoading,
    error,
    ...rest,
  };
}
