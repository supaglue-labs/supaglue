import { SendPassthroughRequestRequest, SendPassthroughRequestResponse } from '@supaglue/types';
import { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import axios from 'axios';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

interface RemoteClientEvents {
  token_refreshed: (accessToken: string, expiresAt: string | null) => void;
}

export interface RemoteClient {
  on<U extends keyof RemoteClientEvents>(event: U, listener: RemoteClientEvents[U]): this;

  listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;
  listCustomObjectRecords(object: string, modifiedAfter?: Date, heartbeat?: () => void): Promise<Readable>;

  sendPassthroughRequest(request: SendPassthroughRequestRequest): Promise<SendPassthroughRequestResponse>;
}

export abstract class AbstractRemoteClient extends EventEmitter implements RemoteClient {
  protected readonly baseUrl: string;

  // this is public so that `CrmRemoteClient` can use `ConstructorParameters<typeof RemoteClient>`
  public constructor(baseUrl: string) {
    super();
    this.baseUrl = baseUrl;
  }

  public on<U extends keyof RemoteClientEvents>(event: U, listener: RemoteClientEvents[U]): this {
    return super.on(event, listener);
  }

  public emit<U extends keyof RemoteClientEvents>(event: U, ...args: Parameters<RemoteClientEvents[U]>): boolean {
    return super.emit(event, ...args);
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  public listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public listCustomObjectRecords(object: string, modifiedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    throw new Error('Not implemented');
  }

  protected abstract getAuthHeadersForPassthroughRequest(): Record<string, string>;

  public async sendPassthroughRequest(request: SendPassthroughRequestRequest): Promise<SendPassthroughRequestResponse> {
    const requestConfig = {
      method: request.method,
      baseURL: this.baseUrl,
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

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
  additionalScopes?: string[];
};
