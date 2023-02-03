import { createContext, FC, ReactNode, useContext, useMemo } from 'react';
import { SgTheme } from '../types/theme';

type SupaglueContextType = {
  apiUrl: string;
  customerId: string;
  theme?: SgTheme;
};

const SupaglueContext = createContext<SupaglueContextType>({
  customerId: '',
  apiUrl: '',
  theme: undefined,
});

type SupaglueProviderProps = {
  children: ReactNode;
  apiUrl: string;
  customerId: string;
  theme?: SgTheme;
};

export const SupaglueProvider: FC<SupaglueProviderProps> = ({ children, customerId, apiUrl, theme, ...rest }) => {
  const context = useMemo(
    () => ({ apiUrl: apiUrl || process.env.NEXT_PUBLIC_SUPAGLUE_HOST || '', customerId, theme }),
    [apiUrl, customerId, theme]
  );

  return (
    <SupaglueContext.Provider value={context} {...rest}>
      {children}
    </SupaglueContext.Provider>
  );
};

export const useSupaglueContext = () => useContext(SupaglueContext);
