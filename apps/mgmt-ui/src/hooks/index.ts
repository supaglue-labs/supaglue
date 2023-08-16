export const fetcher = async <T>(input: RequestInfo, init: RequestInit): Promise<T> => {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const result: T = await res.json();
  return result;
};

export const fetcherWithApplication = async <T>(
  input: { path: string; applicationId: string; transform?: (data: any) => T },
  init: RequestInit
): Promise<T> => {
  const { path, applicationId, transform } = input;
  const supaglueHeaders = new Headers();

  // TODO: data drive these headers based on the active application context
  supaglueHeaders.append('x-application-id', applicationId);

  const res = await fetch(path, { headers: supaglueHeaders, ...init });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const result = await res.json();
  if (transform) {
    return transform(result);
  }
  return result;
};
