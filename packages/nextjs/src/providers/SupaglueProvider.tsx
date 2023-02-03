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

// TODO: ENG-103 implement authentication
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

export const useSupaglueContext = () => useContext(SupaglueContext);
