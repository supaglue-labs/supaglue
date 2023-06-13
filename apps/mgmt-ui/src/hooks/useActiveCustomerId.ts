import { useRouter } from 'next/router';

export function useActiveCustomerId(): string {
  const router = useRouter();
  const { customerId } = router.query;
  if (typeof customerId !== 'string') {
    throw new Error('customerId not found');
  }
  return customerId;
}
