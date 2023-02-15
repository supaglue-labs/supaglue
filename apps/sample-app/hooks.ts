import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const ANONYMOUS_CUSTOMER_ID = 'anonymousCustomerId';

export const useCustomerIdFromSession = () => {
  const session = useSession();
  return session?.data?.user?.name ?? ANONYMOUS_CUSTOMER_ID;
};

export const useActiveTab = (defaultTab: string) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { asPath } = useRouter();
  useEffect(() => {
    const hash = asPath.split('#')[1] ?? '';
    const newActiveTab = hash && decodeURIComponent(hash);

    if (newActiveTab) {
      setActiveTab(newActiveTab);
    }
  }, [asPath]);

  return activeTab;
};
