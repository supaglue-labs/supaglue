import { Application } from '@supaglue/core/types';
import { useRouter } from 'next/router';
import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react';

type ActiveApplicationContextType = {
  // TODO: Force it to be set
  activeApplication: Application;
  setActiveApplication: (application: Application) => void;
};

type useActiveApplicationType = () => ActiveApplicationContextType;

const ActiveApplicationContext = createContext<ActiveApplicationContextType>({
  activeApplication: {
    id: '',
    name: '',
    orgId: '',
    config: {
      webhook: null,
      apiKey: null,
    },
  },
  setActiveApplication: () => {
    throw new Error('Not implemented');
  },
});

type ActiveApplicationManagerProps = PropsWithChildren & {
  initialActiveApplication: Application;
};

export const ActiveApplicationManager: FC<ActiveApplicationManagerProps> = ({ initialActiveApplication, children }) => {
  const router = useRouter();

  const [activeApplication, setActiveApplication] = useState<Application>(initialActiveApplication);

  useEffect(() => {
    router.push(`/applications/${activeApplication.id}`).catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
    });
  }, [activeApplication]);

  return (
    <ActiveApplicationContext.Provider
      value={{
        activeApplication,
        setActiveApplication,
      }}
    >
      {children}
    </ActiveApplicationContext.Provider>
  );
};

export const useActiveApplication: useActiveApplicationType = () => {
  return useContext(ActiveApplicationContext);
};
