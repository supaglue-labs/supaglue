import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import axios from 'axios';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { RequestType } from '../hooks/api';
import { defaultTheme } from '../style/themes';
import { useSupaglueContext } from './supaglueProvider';

export const SupaglueProviderInternal = ({ children }: { children: ReactNode }) => {
  const { apiUrl, theme } = useSupaglueContext();

  const cache = createCache({
    key: 'sg-internal',
    // Prepending allows developers to override css since Emotion styles are at the beginning
    prepend: true,
  });

  return (
    <SWRConfig
      value={{
        fetcher: async (config: RequestType) => {
          const { method = 'GET', path } = config ?? {};
          const res = await axios({ ...config, method, url: `${apiUrl}${path}` });
          return res.data;
        },
      }}
    >
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme ?? defaultTheme}>{children}</ThemeProvider>
      </CacheProvider>
    </SWRConfig>
  );
};
