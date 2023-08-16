export const fetcher = async <T>(input: RequestInfo, init: RequestInit): Promise<T> => {
  const res = await fetch(input, init);
  if (!res.ok) {
    const errorMessage = await getErrorMessage(res);
    throw new Error(errorMessage);
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
    const errorMessage = await getErrorMessage(res);
    throw new Error(errorMessage);
  }
  const result = await res.json();
  if (transform) {
    return transform(result);
  }
  return result;
};

async function getErrorMessage(res: Response): Promise<string> {
  const data = await res.json();
  return (
    data.errors?.map((error: any) => `${error.title}: ${error.detail}`).join('\n') ?? res.statusText ?? 'Unknown error'
  );
}
