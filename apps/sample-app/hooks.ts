import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const ANONYMOUS_CUSTOMER_ID = 'anonymousCustomerId';

export const useCustomerIdFromSession = () => {
  const session = useSession();
  return session?.data?.user?.name ?? ANONYMOUS_CUSTOMER_ID;
};

export const useActiveTab = (defaultTab: string) => {
  const { asPath } = useRouter();
  const hash = asPath.split('#')[1] ?? '';
  return hash ? decodeURIComponent(hash) : defaultTab;
};
