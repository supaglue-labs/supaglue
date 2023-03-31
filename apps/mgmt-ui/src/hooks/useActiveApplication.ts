import { Application } from '@supaglue/types/application';
import useSWR from 'swr';
import { fetcher } from '.';
import { useActiveApplicationId } from './useActiveApplicationId';

export function useActiveApplication() {
  const applicationId = useActiveApplicationId();
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
