import { camelcaseKeys } from '@/utils/camelcase';
import { Application } from '@supaglue/core/types/application';
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
    activeApplication: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
