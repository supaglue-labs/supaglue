import { useRouter } from 'next/router';

export function useActiveApplicationId() {
  const router = useRouter();
  const { applicationId } = router.query;
  return applicationId;
}
