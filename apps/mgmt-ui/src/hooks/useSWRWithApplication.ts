import { useRouter } from 'next/router';
import useSWR from 'swr';
import { fetcherWithApplication } from '.';

export function useSWRWithApplication<T>(path: string) {
  const router = useRouter();
  const { applicationId } = router.query;

  return useSWR(
    {
      path,
      applicationId,
    },
    fetcherWithApplication<T>,
    {
      keepPreviousData: true,
    }
  );
}
