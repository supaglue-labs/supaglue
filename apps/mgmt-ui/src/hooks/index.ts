import { APPLICATION_ID, CUSTOMER_ID, PROVIDER_NAME } from '@/client';

export const fetcher = (input: RequestInfo, init: RequestInit) => {
  const supaglueHeaders = new Headers();

  // TODO: data drive these headers based on the active application context
  supaglueHeaders.append('x-customer-id', CUSTOMER_ID);
  supaglueHeaders.append('x-provider-name', PROVIDER_NAME);
  supaglueHeaders.append('x-application-id', APPLICATION_ID);

  return fetch(input, { headers: supaglueHeaders, ...init }).then((res) => res.json());
};
