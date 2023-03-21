export const fetcher = <T>(input: RequestInfo, init: RequestInit): Promise<T> => {
  return fetch(input, init).then<T>((res) => res.json());
};

export const fetcherWithApplication = <T>(
  input: { path: string; applicationId: string },
  init: RequestInit
): Promise<T> => {
  // TODO: type
  const { path, applicationId } = input;
  const supaglueHeaders = new Headers();

  // TODO: data drive these headers based on the active application context
  supaglueHeaders.append('x-application-id', applicationId);

  return fetch(path, { headers: supaglueHeaders, ...init }).then<T>((res) => res.json());
};
