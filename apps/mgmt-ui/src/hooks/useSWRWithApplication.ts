import { useRouter } from 'next/router';
import useSWR from 'swr';
import { fetcherWithApplication } from '.';

export function useSWRWithApplication<T>(path: string, transform?: (data: any) => T) {
  const router = useRouter();
  const { applicationId } = router.query;

  return useSWR(
    {
      path,
      applicationId,
      transform,
    },
    fetcherWithApplication<T>,
    {
      keepPreviousData: true,
    }
  );
}
