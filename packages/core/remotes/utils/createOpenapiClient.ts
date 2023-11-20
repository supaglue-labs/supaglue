import type { FetchOptions, FetchResponse } from 'openapi-fetch';
import createClient from 'openapi-fetch';
// @ts-expect-error Not sure we get The current file is a CommonJS module whose imports will
// produce 'require' calls error, but it's ireelevant and thus we will suppress it
import type { PathsWithMethod } from 'openapi-typescript-helpers';

type HTTPMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH' | 'TRACE';
type MaybePromise<T> = T | Promise<T>;
type _ClientOptions = NonNullable<Parameters<typeof createClient>[0]>;
type Fetch = NonNullable<_ClientOptions['fetch']>;
type FetchParams = [string, Parameters<Fetch>[1]];

// Workaround for https://github.com/drwpow/openapi-typescript/issues/1122

// MARK: - OpenAPI client
interface ClientOptions extends _ClientOptions {
  preRequest?: (...args: FetchParams) => MaybePromise<FetchParams>;
  postRequest?: (res: Awaited<ReturnType<Fetch>>, requestArgs: FetchParams) => ReturnType<Fetch>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function createOpenapiClient<Paths extends {}>({
  preRequest = (url, init) => [url, init],
  postRequest = (res) => Promise.resolve(res),
  ...clientOptions
}: ClientOptions = {}) {
  const baseFetch: Fetch = clientOptions?.fetch ?? globalThis.fetch;
  const customFetch: Fetch = async (url, init) => {
    const requestArgs = await preRequest(url as string, init);
    const res = await baseFetch(...requestArgs);
    return postRequest(res, requestArgs);
  };
  const client = createClient<Paths>({ ...clientOptions, fetch: customFetch });

  return {
    client,
    /** Untyped request */
    request: <T>(method: HTTPMethod, url: string, options?: Omit<FetchOptions<unknown>, 'body'> & { body?: unknown }) =>
      client[method as 'GET'](url as never, options as never).then(throwIfNotOk(method)) as Promise<{
        data: T;
        response: FetchResponse<unknown>['response'];
      }>,
    GET: <P extends PathsWithMethod<Paths, 'get'>>(...args: Parameters<typeof client.GET<P>>) =>
      client.GET<P>(...args).then(throwIfNotOk('GET')),
    PUT: <P extends PathsWithMethod<Paths, 'put'>>(...args: Parameters<typeof client.PUT<P>>) =>
      client.PUT(...args).then(throwIfNotOk('PUT')),
    POST: <P extends PathsWithMethod<Paths, 'post'>>(...args: Parameters<typeof client.POST<P>>) =>
      client.POST(...args).then(throwIfNotOk('POST')),
    DELETE: <P extends PathsWithMethod<Paths, 'delete'>>(...args: Parameters<typeof client.DELETE<P>>) =>
      client.DELETE(...args).then(throwIfNotOk('DELETE')),
    OPTIONS: <P extends PathsWithMethod<Paths, 'options'>>(...args: Parameters<typeof client.OPTIONS<P>>) =>
      client.OPTIONS(...args).then(throwIfNotOk('OPTIONS')),
    HEAD: <P extends PathsWithMethod<Paths, 'head'>>(...args: Parameters<typeof client.HEAD<P>>) =>
      client.HEAD(...args).then(throwIfNotOk('HEAD')),
    PATCH: <P extends PathsWithMethod<Paths, 'patch'>>(...args: Parameters<typeof client.PATCH<P>>) =>
      client.PATCH(...args).then(throwIfNotOk('PATCH')),
    TRACE: <P extends PathsWithMethod<Paths, 'trace'>>(...args: Parameters<typeof client.TRACE<P>>) =>
      client.TRACE(...args).then(throwIfNotOk('TRACE')),
  };
}

export class HTTPError<T> extends Error {
  override name = 'HTTPError';
  readonly method: HTTPMethod;
  readonly error: Extract<FetchResponse<T>, { error: unknown }>['error'];
  readonly response: FetchResponse<T>['response'];

  get code() {
    return this.response?.status;
  }

  constructor({ method, error, response }: Extract<FetchResponse<T>, { error: unknown }> & { method: HTTPMethod }) {
    super(`[HTTP ${response.status}]: ${method.toUpperCase()} ${response.url}`);
    this.method = method;
    this.error = error;
    this.response = response;
    Object.setPrototypeOf(this, HTTPError.prototype);
  }
}

// TODO: Introduce an createOpenapiOauthClient that handles token refreshes

function throwIfNotOk<T>(method: HTTPMethod) {
  return (res: FetchResponse<T>) => {
    if (res.error) {
      // eslint-disable-next-line no-console
      console.log(res.error);
      throw new HTTPError<T>({ method, error: res.error, response: res.response });
    }
    // You can further modify response as desired...
    return res as Extract<FetchResponse<T>, { data: unknown }>;
  };
}

// MARK :- OpenAPI Oauth Client

export const REFRESH_TOKEN_THRESHOLD_MS = 300000; // 5 minutes
interface OauthTokens {
  accessToken: string;
  refreshToken: string;
  /** ISO string */
  expiresAt: string | null;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type OAuthClientOptions<Paths extends {} = {}> = ClientOptions & {
  tokens: OauthTokens;
  refreshTokens: (client: ReturnType<typeof createOpenapiOauthClient<Paths>>) => Promise<OauthTokens>;
  onTokenRefreshed?: (tokens: OauthTokens) => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function createOpenapiOauthClient<Paths extends {}>({
  tokens: initialTokens,
  refreshTokens,
  onTokenRefreshed,
  preRequest = (url, init) => [url, init],
  ...options
}: OAuthClientOptions<Paths>) {
  let tokens = initialTokens;
  const client = createOpenapiClient<Paths>({
    ...options,
    preRequest: async (url, init) => {
      // Proactive refresh access token
      if (!tokens.expiresAt || Date.parse(tokens.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS) {
        tokens = await refreshTokens(client);
        onTokenRefreshed?.(tokens);
      }
      return preRequest(url, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${tokens.accessToken}` } });
    },
  });
  return client;
}
