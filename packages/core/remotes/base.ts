import type {
  ObjectRecordUpsertData,
  ObjectRecordWithMetadata,
  Property,
  RemoteUserIdAndDetails,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type {
  ListObjectAssociationsParams,
  ObjectAssociation,
  ObjectAssociationCreateParams,
} from '@supaglue/types/association';
import type { AssociationTypeCardinality, SimpleAssociationType } from '@supaglue/types/association_type';
import type {
  CustomObject,
  CustomObjectCreateParams,
  CustomObjectUpdateParams,
  SimpleCustomObject,
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
  listCustomObjects(): Promise<SimpleCustomObject[]>;
  getCustomObject(id: string): Promise<CustomObject>;
  createCustomObject(params: CustomObjectCreateParams): Promise<string>;
  updateCustomObject(params: CustomObjectUpdateParams): Promise<void>;

  listAssociationTypes(
    sourceObject: StandardOrCustomObject,
    targetObject: StandardOrCustomObject
  ): Promise<SimpleAssociationType[]>;
  createAssociationType(
    sourceObject: StandardOrCustomObject,
    targetObject: StandardOrCustomObject,
    keyName: string,
    displayName: string,
    cardinality: AssociationTypeCardinality
  ): Promise<void>;

  listAssociations(params: ListObjectAssociationsParams): Promise<ObjectAssociation[]>;
  createAssociation(params: ObjectAssociationCreateParams): Promise<ObjectAssociation>;

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
  public async listCustomObjects(): Promise<SimpleCustomObject[]> {
    throw new Error('Not implemented');
  }
  public async getCustomObject(id: string): Promise<CustomObject> {
    throw new Error('Not implemented');
  }
  public async createCustomObject(params: CustomObjectCreateParams): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCustomObject(params: CustomObjectUpdateParams): Promise<void> {
    throw new Error('Not implemented');
  }

  public async listAssociationTypes(
    sourceObject: StandardOrCustomObject,
    targetObject: StandardOrCustomObject
  ): Promise<SimpleAssociationType[]> {
    throw new Error('Not implemented');
  }
  public async createAssociationType(
    sourceObject: StandardOrCustomObject,
    targetObject: StandardOrCustomObject,
    keyName: string,
    displayName: string,
    cardinality: AssociationTypeCardinality
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  public async listAssociations(params: ListObjectAssociationsParams): Promise<ObjectAssociation[]> {
    throw new Error('Not implemented');
  }
  public async createAssociation(params: ObjectAssociationCreateParams): Promise<ObjectAssociation> {
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
