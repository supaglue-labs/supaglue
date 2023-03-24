import { useRouter } from 'next/router';

export function useActiveApplicationId(): string {
  const router = useRouter();
  const { applicationId } = router.query;
  if (typeof applicationId !== 'string') {
    throw new Error('applicationId not found');
  }
  return applicationId;
}
