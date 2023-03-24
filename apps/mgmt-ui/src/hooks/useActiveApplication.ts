import { camelcaseKeys } from '@/utils/camelcase';
import { Application } from '@supaglue/core/types/application';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { fetcher } from '.';

export function useActiveApplication() {
  const router = useRouter();
  const { applicationId } = router.query;
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
