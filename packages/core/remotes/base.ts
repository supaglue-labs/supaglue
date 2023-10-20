import type {
  ObjectRecordUpsertData,
  ObjectRecordWithMetadata,
  Property,
  RemoteUserIdAndDetails,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type { Association, AssociationCreateParams, ListAssociationsParams } from '@supaglue/types/association';
import type { AssociationSchema, SimpleAssociationSchema } from '@supaglue/types/association_schema';
import type {
  CustomObjectSchema,
  CustomObjectSchemaCreateParams,
  CustomObjectSchemaUpdateParams,
  SimpleCustomObjectSchema,
} from '@supaglue/types/custom_object';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
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

  listProperties(object: StandardOrCustomObjectDef): Promise<Property[]>;

  createObjectRecord(object: StandardOrCustomObject, data: ObjectRecordUpsertData): Promise<string>;
  getObjectRecord(object: StandardOrCustomObject, id: string, fields: string[]): Promise<ObjectRecordWithMetadata>;
  updateObjectRecord(object: StandardOrCustomObject, id: string, data: ObjectRecordUpsertData): Promise<void>;

  listStandardObjects(): Promise<string[]>;
  listCustomObjectSchemas(): Promise<SimpleCustomObjectSchema[]>;
  getCustomObjectSchema(id: string): Promise<CustomObjectSchema>;
  createCustomObjectSchema(params: CustomObjectSchemaCreateParams): Promise<string>;
  updateCustomObjectSchema(params: CustomObjectSchemaUpdateParams): Promise<void>;

  listAssociationSchemas(sourceObject: string, targetObject: string): Promise<SimpleAssociationSchema[]>;
  createAssociationSchema(
    sourceObject: string,
    targetObject: string,
    keyName: string,
    displayName: string
  ): Promise<AssociationSchema>;

  listAssociations(params: ListAssociationsParams): Promise<Association[]>;
  createAssociation(params: AssociationCreateParams): Promise<Association>;

  listStandardObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;
  listCustomObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;

  sendPassthroughRequest(request: SendPassthroughRequestRequest): Promise<SendPassthroughRequestResponse>;

  getUserIdAndDetails(): Promise<RemoteUserIdAndDetails>;
  getUserIdAndDetails__v2_1(): Promise<RemoteUserIdAndDetails>;
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

  public listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    throw new Error('Not implemented');
  }

  public async createObjectRecord(object: StandardOrCustomObject, data: ObjectRecordUpsertData): Promise<string> {
    throw new Error('Not implemented');
  }

  public async getObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    fields: string[]
  ): Promise<ObjectRecordWithMetadata> {
    throw new Error('Not implemented');
  }

  public async updateObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    data: ObjectRecordUpsertData
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  public async listStandardObjects(): Promise<string[]> {
    throw new Error('Not implemented');
  }
  public async listCustomObjectSchemas(): Promise<SimpleCustomObjectSchema[]> {
    throw new Error('Not implemented');
  }
  public async getCustomObjectSchema(id: string): Promise<CustomObjectSchema> {
    throw new Error('Not implemented');
  }
  public async createCustomObjectSchema(params: CustomObjectSchemaCreateParams): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCustomObjectSchema(params: CustomObjectSchemaUpdateParams): Promise<void> {
    throw new Error('Not implemented');
  }

  public async listAssociationSchemas(sourceObject: string, targetObject: string): Promise<SimpleAssociationSchema[]> {
    throw new Error('Not implemented');
  }
  public async createAssociationSchema(
    sourceObject: string,
    targetObject: string,
    keyName: string,
    displayName: string
  ): Promise<AssociationSchema> {
    throw new Error('Not implemented');
  }

  public async listAssociations(params: ListAssociationsParams): Promise<Association[]> {
    throw new Error('Not implemented');
  }
  public async createAssociation(params: AssociationCreateParams): Promise<Association> {
    throw new Error('Not implemented');
  }

  public async listStandardObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public listCustomObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getUserIdAndDetails(): Promise<RemoteUserIdAndDetails> {
    throw new NotImplementedError();
  }
  public async getUserIdAndDetails__v2_1(): Promise<RemoteUserIdAndDetails> {
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
