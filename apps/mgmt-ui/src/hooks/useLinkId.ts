import { useRouter } from 'next/router';

export function useLinkId(): string {
  const router = useRouter();
  const { linkId } = router.query;
  if (typeof linkId !== 'string') {
    throw new Error('linkId not found');
  }
  return linkId;
}
