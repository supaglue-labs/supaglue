import axios from 'axios';
import { createContext, FC, ReactNode, useContext, useMemo } from 'react';
import { SWRConfig } from 'swr';
import { RequestType } from '../hooks/api';

const SupaglueContext = createContext({
  customerId: '',
  apiUrl: '',
});

type SupaglueProviderProps = {
  children: ReactNode;
  apiUrl?: string;
  customerId: string;
};

// TODO: ENG-103 implement authentication
export const SupaglueProvider: FC<SupaglueProviderProps> = ({ children, customerId, apiUrl, ...rest }) => {
  const context = useMemo(
    () => ({ apiUrl: apiUrl ?? process.env.NEXT_PUBLIC_SUPAGLUE_HOST ?? '', customerId }),
    [apiUrl, customerId]
  );

  return (
    <SupaglueContext.Provider value={context} {...rest}>
      <SWRConfig
        value={{
          fetcher: async (config: RequestType) => {
            const { apiUrl } = context;
            const { method = 'GET', path } = config ?? {};
            const res = await axios({ ...config, method, url: `${apiUrl}${path}` });
            return res.data;
          },
        }}
      >
        {children}
      </SWRConfig>
    </SupaglueContext.Provider>
  );
};

export const useSupaglueContext = () => useContext(SupaglueContext);
