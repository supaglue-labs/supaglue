import axios, { AxiosError } from 'axios';
import useSWR from 'swr';

export type RequestType = {
  path: string;
  method?: string;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export function useIntegration(customerId: string, type = 'salesforce') {
  const result = useSWR<any, AxiosError, RequestType>({
    path: '/integrations',
    params: { customerId, type },
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
    // eslint-disable-next-line no-console
    console.error('Error updating sync:', err);
  }
}

export async function triggerSync(url: string) {
  try {
    return await axios({ url, method: 'POST' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error triggering sync:', err);
  }
}
