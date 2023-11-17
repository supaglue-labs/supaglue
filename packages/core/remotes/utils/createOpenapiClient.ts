import type { FetchResponse } from 'openapi-fetch';
import createClient from 'openapi-fetch';

type MaybePromise<T> = T | Promise<T>;

type _ClientOptions = NonNullable<Parameters<typeof createClient>[0]>;
// Workaround for https://github.com/drwpow/openapi-typescript/issues/1122
interface ClientOptions extends _ClientOptions {
  preRequest?: (...args: Parameters<typeof fetch>) => MaybePromise<Parameters<typeof fetch>>;
  postRequest?: (
    res: Awaited<ReturnType<typeof fetch>>,
    requestArgs: Parameters<typeof fetch>
  ) => ReturnType<typeof fetch>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function createOpenapiClient<Paths extends {}>({
  preRequest = (url, init) => [url, init],
  postRequest = (res) => Promise.resolve(res),
  ...clientOptions
}: ClientOptions = {}) {
  const baseFetch = clientOptions?.fetch ?? globalThis.fetch;
  const customFetch: typeof baseFetch = async (...args) => {
    const requestArgs = await preRequest(...args);
    const res = await baseFetch(...requestArgs);
    return postRequest(res, requestArgs);
  };
  const client = createClient<Paths>({ ...clientOptions, fetch: customFetch });

  return {
    GET: (...args: Parameters<typeof client.GET>) => client.GET(...args).then(throwIfNotOk),
    PUT: (...args: Parameters<typeof client.PUT>) => client.PUT(...args).then(throwIfNotOk),
    POST: (...args: Parameters<typeof client.POST>) => client.POST(...args).then(throwIfNotOk),
    DELETE: (...args: Parameters<typeof client.DELETE>) => client.DELETE(...args).then(throwIfNotOk),
    OPTIONS: (...args: Parameters<typeof client.OPTIONS>) => client.OPTIONS(...args).then(throwIfNotOk),
    HEAD: (...args: Parameters<typeof client.HEAD>) => client.HEAD(...args).then(throwIfNotOk),
    PATCH: (...args: Parameters<typeof client.PATCH>) => client.PATCH(...args).then(throwIfNotOk),
    TRACE: (...args: Parameters<typeof client.TRACE>) => client.TRACE(...args).then(throwIfNotOk),
  };
}

function throwIfNotOk<T>(res: FetchResponse<T>) {
  if (res.error) {
    // TODO: Return more detailed error here...
    // eslint-disable-next-line no-console
    console.log(res.error);
    throw new Error('HTTPError');
  }
  // You can further modify response as desired...
  return res;
}
