import type { MagicLinkData } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { fetcher } from '.';

export function useMagicLinkData() {
  const router = useRouter();
  const { linkId } = router.query;
  if (typeof linkId !== 'string') {
    throw new Error('linkId not found');
  }
  const { data, error, isLoading, ...rest } = useSWR(`/api/internal/links/${linkId}`, fetcher<MagicLinkData>);

  return {
    data: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
