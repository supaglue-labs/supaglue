import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createContext, FC, ReactNode, useContext, useMemo } from 'react';

const SupaglueContext = createContext({
  customerId: '',
  apiUrl: '',
});

type SupaglueProviderProps = {
  children: ReactNode;
  apiUrl: string;
  customerId: string;
};

export const SupaglueProvider: FC<SupaglueProviderProps> = ({ children, customerId, apiUrl, ...rest }) => {
  const context = useMemo(
    () => ({ apiUrl: apiUrl || process.env.NEXT_PUBLIC_SUPAGLUE_HOST || '', customerId }),
    [apiUrl, customerId]
  );

  return (
    <SupaglueContext.Provider value={context} {...rest}>
      {children}
    </SupaglueContext.Provider>
  );
};

type SgCacheProviderProps = {
  children: ReactNode;
};

export const SgCacheProvider: FC<SgCacheProviderProps> = ({ children }) => {
  const cache = createCache({
    key: 'sg-internal',
    // Prepending allows developers to override css since Emotion styles are at the beginning
    prepend: true,
  });
  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export const useSupaglueContext = () => useContext(SupaglueContext);
