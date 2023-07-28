import type {
  ObjectRecord,
  ObjectRecordUpsertData,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { StandardOrCustomObject } from '@supaglue/types/standard_or_custom_object';
import axios from 'axios';
import { EventEmitter } from 'events';
import type { Readable } from 'stream';
import { NotImplementedError } from '../errors';

interface RemoteClientEvents {
  token_refreshed: (args: { accessToken: string; refreshToken?: string; expiresAt: string | null }) => void;
}

export interface RemoteClient {
  on<U extends keyof RemoteClientEvents>(event: U, listener: RemoteClientEvents[U]): this;

  createObjectRecord(object: StandardOrCustomObject, data: ObjectRecordUpsertData): Promise<string>;
  getObjectRecord(object: StandardOrCustomObject, id: string, fields: string[]): Promise<ObjectRecord>;
  updateObjectRecord(object: StandardOrCustomObject, id: string, data: ObjectRecordUpsertData): Promise<void>;

  listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;
  listCustomObjectRecords(object: string, modifiedAfter?: Date, heartbeat?: () => void): Promise<Readable>;

  sendPassthroughRequest(request: SendPassthroughRequestRequest): Promise<SendPassthroughRequestResponse>;

  getUserId(): Promise<string | undefined>;
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

  public async createObjectRecord(object: StandardOrCustomObject, data: ObjectRecordUpsertData): Promise<string> {
    throw new Error('Not implemented');
  }

  public async getObjectRecord(object: StandardOrCustomObject, id: string, fields: string[]): Promise<ObjectRecord> {
    throw new Error('Not implemented');
  }

  public async updateObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    data: ObjectRecordUpsertData
  ): Promise<void> {
    throw new Error('Not implemented');
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

  public async getUserId(): Promise<string | undefined> {
    throw new NotImplementedError();
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
