import axios from 'axios';
import { EventEmitter } from 'events';
import { SendPassthroughRequestRequest, SendPassthroughRequestResponse } from '../types/passthrough';

interface RemoteClientEvents {
  token_refreshed: (accessToken: string, expiresAt: string | null) => void;
}

export interface RemoteClient {
  on<U extends keyof RemoteClientEvents>(event: U, listener: RemoteClientEvents[U]): this;

  sendPassthroughRequest(request: SendPassthroughRequestRequest): Promise<SendPassthroughRequestResponse>;
}

export abstract class AbstractRemoteClient extends EventEmitter implements RemoteClient {
  readonly #baseUrl: string;

  // this is public so that `CrmRemoteClient` can use `ConstructorParameters<typeof RemoteClient>`
  public constructor(baseUrl: string) {
    super();
    this.#baseUrl = baseUrl;
  }

  public on<U extends keyof RemoteClientEvents>(event: U, listener: RemoteClientEvents[U]): this {
    return super.on(event, listener);
  }

  public emit<U extends keyof RemoteClientEvents>(event: U, ...args: Parameters<RemoteClientEvents[U]>): boolean {
    return super.emit(event, ...args);
  }

  protected abstract getAuthHeadersForPassthroughRequest(): Record<string, string>;

  public async sendPassthroughRequest(request: SendPassthroughRequestRequest): Promise<SendPassthroughRequestResponse> {
    const requestConfig = {
      method: request.method,
      baseURL: this.#baseUrl,
      url: request.path,
      params: request.query,
      headers: {
        ...request.headers,
        ...this.getAuthHeadersForPassthroughRequest(),
      },
      data: request.body,
      validateStatus: () => true, // never throw on status code
    };

    const remoteResponse = await axios.request(requestConfig);

    return {
      url: axios.getUri(requestConfig),
      status: remoteResponse.status,
      headers: remoteResponse.headers as Record<string, string>,
      // TODO: Should we always return string instead, instead of having axios
      // transform the body?
      body: remoteResponse.data,
    };
  }
}
