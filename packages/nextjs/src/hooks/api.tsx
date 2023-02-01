import axios, { AxiosError } from 'axios';
import { ReactNode } from 'react';
import useSWR, { SWRConfig } from 'swr';
import { useSupaglueContext } from '../provider';

export type RequestType = {
  path: string;
  method?: string;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export function useSalesforceIntegration(customerId: string) {
  const result = useSWR<any, AxiosError, RequestType>({
    path: '/integrations',
    params: { customerId, type: 'salesforce' },
  });

  return result;
}

export function useDeveloperConfig() {
  const result = useSWR<any, AxiosError, RequestType>({
    path: '/developer_config',
  });

  return result;
}

export async function updateSync(url: string, { arg }: { arg: any }) {
  try {
    return await axios({ url, method: 'PUT', data: arg });
  } catch (err) {
    console.error('Error updating sync:', err);
  }
}

export async function triggerSync(url: string) {
  try {
    return await axios({ url, method: 'POST' });
  } catch (err) {
    console.error('Error triggering sync:', err);
  }
}

export const SupaglueApiProviderInternal = ({ children }: { children: ReactNode }) => {
  const { apiUrl } = useSupaglueContext();

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
      {children}
    </SWRConfig>
  );
};
