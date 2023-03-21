import { useActiveApplication } from '@/context/activeApplication';
import useSWR from 'swr';
import { fetcherWithApplication } from '.';

export function useSWRWithApplication<T>(path: string) {
  const { activeApplication } = useActiveApplication();

  return useSWR(
    {
      path,
      applicationId: activeApplication.id,
    },
    fetcherWithApplication<T>
  );
}
