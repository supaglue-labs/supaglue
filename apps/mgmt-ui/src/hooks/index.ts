export const APPLICATION_ID = 'a4398523-03a2-42dd-9681-c91e3e2efaf4';

export const fetcher = (input: RequestInfo, init: RequestInit) => {
  const supaglueHeaders = new Headers();

  // TODO: data drive these headers based on the active application context
  supaglueHeaders.append('x-application-id', APPLICATION_ID);

  return fetch(input, { headers: supaglueHeaders, ...init }).then((res) => res.json());
};
