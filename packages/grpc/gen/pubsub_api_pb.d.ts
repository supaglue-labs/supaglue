// package: eventbus.v1
// file: pubsub_api.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from 'google-protobuf';

export class TopicInfo extends jspb.Message {
  getTopicName(): string;
  setTopicName(value: string): TopicInfo;
  getTenantGuid(): string;
  setTenantGuid(value: string): TopicInfo;
  getCanPublish(): boolean;
  setCanPublish(value: boolean): TopicInfo;
  getCanSubscribe(): boolean;
  setCanSubscribe(value: boolean): TopicInfo;
  getSchemaId(): string;
  setSchemaId(value: string): TopicInfo;
  getRpcId(): string;
  setRpcId(value: string): TopicInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TopicInfo.AsObject;
  static toObject(includeInstance: boolean, msg: TopicInfo): TopicInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: TopicInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TopicInfo;
  static deserializeBinaryFromReader(message: TopicInfo, reader: jspb.BinaryReader): TopicInfo;
}

export namespace TopicInfo {
  export type AsObject = {
    topicName: string;
    tenantGuid: string;
    canPublish: boolean;
    canSubscribe: boolean;
    schemaId: string;
    rpcId: string;
  };
}

export class TopicRequest extends jspb.Message {
  getTopicName(): string;
  setTopicName(value: string): TopicRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TopicRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TopicRequest): TopicRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: TopicRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TopicRequest;
  static deserializeBinaryFromReader(message: TopicRequest, reader: jspb.BinaryReader): TopicRequest;
}

export namespace TopicRequest {
  export type AsObject = {
    topicName: string;
  };
}

export class EventHeader extends jspb.Message {
  getKey(): string;
  setKey(value: string): EventHeader;
  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): EventHeader;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventHeader.AsObject;
  static toObject(includeInstance: boolean, msg: EventHeader): EventHeader.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: EventHeader, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventHeader;
  static deserializeBinaryFromReader(message: EventHeader, reader: jspb.BinaryReader): EventHeader;
}

export namespace EventHeader {
  export type AsObject = {
    key: string;
    value: Uint8Array | string;
  };
}

export class ProducerEvent extends jspb.Message {
  getId(): string;
  setId(value: string): ProducerEvent;
  getSchemaId(): string;
  setSchemaId(value: string): ProducerEvent;
  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): ProducerEvent;
  clearHeadersList(): void;
  getHeadersList(): Array<EventHeader>;
  setHeadersList(value: Array<EventHeader>): ProducerEvent;
  addHeaders(value?: EventHeader, index?: number): EventHeader;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProducerEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ProducerEvent): ProducerEvent.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: ProducerEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProducerEvent;
  static deserializeBinaryFromReader(message: ProducerEvent, reader: jspb.BinaryReader): ProducerEvent;
}

export namespace ProducerEvent {
  export type AsObject = {
    id: string;
    schemaId: string;
    payload: Uint8Array | string;
    headersList: Array<EventHeader.AsObject>;
  };
}

export class ConsumerEvent extends jspb.Message {
  hasEvent(): boolean;
  clearEvent(): void;
  getEvent(): ProducerEvent | undefined;
  setEvent(value?: ProducerEvent): ConsumerEvent;
  getReplayId(): Uint8Array | string;
  getReplayId_asU8(): Uint8Array;
  getReplayId_asB64(): string;
  setReplayId(value: Uint8Array | string): ConsumerEvent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConsumerEvent.AsObject;
  static toObject(includeInstance: boolean, msg: ConsumerEvent): ConsumerEvent.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: ConsumerEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConsumerEvent;
  static deserializeBinaryFromReader(message: ConsumerEvent, reader: jspb.BinaryReader): ConsumerEvent;
}

export namespace ConsumerEvent {
  export type AsObject = {
    event?: ProducerEvent.AsObject;
    replayId: Uint8Array | string;
  };
}

export class PublishResult extends jspb.Message {
  getReplayId(): Uint8Array | string;
  getReplayId_asU8(): Uint8Array;
  getReplayId_asB64(): string;
  setReplayId(value: Uint8Array | string): PublishResult;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): PublishResult;
  getCorrelationkey(): string;
  setCorrelationkey(value: string): PublishResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PublishResult.AsObject;
  static toObject(includeInstance: boolean, msg: PublishResult): PublishResult.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PublishResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PublishResult;
  static deserializeBinaryFromReader(message: PublishResult, reader: jspb.BinaryReader): PublishResult;
}

export namespace PublishResult {
  export type AsObject = {
    replayId: Uint8Array | string;
    error?: Error.AsObject;
    correlationkey: string;
  };
}

export class Error extends jspb.Message {
  getCode(): ErrorCode;
  setCode(value: ErrorCode): Error;
  getMsg(): string;
  setMsg(value: string): Error;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Error.AsObject;
  static toObject(includeInstance: boolean, msg: Error): Error.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: Error, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Error;
  static deserializeBinaryFromReader(message: Error, reader: jspb.BinaryReader): Error;
}

export namespace Error {
  export type AsObject = {
    code: ErrorCode;
    msg: string;
  };
}

export class FetchRequest extends jspb.Message {
  getTopicName(): string;
  setTopicName(value: string): FetchRequest;
  getReplayPreset(): ReplayPreset;
  setReplayPreset(value: ReplayPreset): FetchRequest;
  getReplayId(): Uint8Array | string;
  getReplayId_asU8(): Uint8Array;
  getReplayId_asB64(): string;
  setReplayId(value: Uint8Array | string): FetchRequest;
  getNumRequested(): number;
  setNumRequested(value: number): FetchRequest;
  getAuthRefresh(): string;
  setAuthRefresh(value: string): FetchRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FetchRequest.AsObject;
  static toObject(includeInstance: boolean, msg: FetchRequest): FetchRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: FetchRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FetchRequest;
  static deserializeBinaryFromReader(message: FetchRequest, reader: jspb.BinaryReader): FetchRequest;
}

export namespace FetchRequest {
  export type AsObject = {
    topicName: string;
    replayPreset: ReplayPreset;
    replayId: Uint8Array | string;
    numRequested: number;
    authRefresh: string;
  };
}

export class FetchResponse extends jspb.Message {
  clearEventsList(): void;
  getEventsList(): Array<ConsumerEvent>;
  setEventsList(value: Array<ConsumerEvent>): FetchResponse;
  addEvents(value?: ConsumerEvent, index?: number): ConsumerEvent;
  getLatestReplayId(): Uint8Array | string;
  getLatestReplayId_asU8(): Uint8Array;
  getLatestReplayId_asB64(): string;
  setLatestReplayId(value: Uint8Array | string): FetchResponse;
  getRpcId(): string;
  setRpcId(value: string): FetchResponse;
  getPendingNumRequested(): number;
  setPendingNumRequested(value: number): FetchResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FetchResponse.AsObject;
  static toObject(includeInstance: boolean, msg: FetchResponse): FetchResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: FetchResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FetchResponse;
  static deserializeBinaryFromReader(message: FetchResponse, reader: jspb.BinaryReader): FetchResponse;
}

export namespace FetchResponse {
  export type AsObject = {
    eventsList: Array<ConsumerEvent.AsObject>;
    latestReplayId: Uint8Array | string;
    rpcId: string;
    pendingNumRequested: number;
  };
}

export class SchemaRequest extends jspb.Message {
  getSchemaId(): string;
  setSchemaId(value: string): SchemaRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SchemaRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SchemaRequest): SchemaRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: SchemaRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SchemaRequest;
  static deserializeBinaryFromReader(message: SchemaRequest, reader: jspb.BinaryReader): SchemaRequest;
}

export namespace SchemaRequest {
  export type AsObject = {
    schemaId: string;
  };
}

export class SchemaInfo extends jspb.Message {
  getSchemaJson(): string;
  setSchemaJson(value: string): SchemaInfo;
  getSchemaId(): string;
  setSchemaId(value: string): SchemaInfo;
  getRpcId(): string;
  setRpcId(value: string): SchemaInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SchemaInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SchemaInfo): SchemaInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: SchemaInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SchemaInfo;
  static deserializeBinaryFromReader(message: SchemaInfo, reader: jspb.BinaryReader): SchemaInfo;
}

export namespace SchemaInfo {
  export type AsObject = {
    schemaJson: string;
    schemaId: string;
    rpcId: string;
  };
}

export class PublishRequest extends jspb.Message {
  getTopicName(): string;
  setTopicName(value: string): PublishRequest;
  clearEventsList(): void;
  getEventsList(): Array<ProducerEvent>;
  setEventsList(value: Array<ProducerEvent>): PublishRequest;
  addEvents(value?: ProducerEvent, index?: number): ProducerEvent;
  getAuthRefresh(): string;
  setAuthRefresh(value: string): PublishRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PublishRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PublishRequest): PublishRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PublishRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PublishRequest;
  static deserializeBinaryFromReader(message: PublishRequest, reader: jspb.BinaryReader): PublishRequest;
}

export namespace PublishRequest {
  export type AsObject = {
    topicName: string;
    eventsList: Array<ProducerEvent.AsObject>;
    authRefresh: string;
  };
}

export class PublishResponse extends jspb.Message {
  clearResultsList(): void;
  getResultsList(): Array<PublishResult>;
  setResultsList(value: Array<PublishResult>): PublishResponse;
  addResults(value?: PublishResult, index?: number): PublishResult;
  getSchemaId(): string;
  setSchemaId(value: string): PublishResponse;
  getRpcId(): string;
  setRpcId(value: string): PublishResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PublishResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PublishResponse): PublishResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> };
  static serializeBinaryToWriter(message: PublishResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PublishResponse;
  static deserializeBinaryFromReader(message: PublishResponse, reader: jspb.BinaryReader): PublishResponse;
}

export namespace PublishResponse {
  export type AsObject = {
    resultsList: Array<PublishResult.AsObject>;
    schemaId: string;
    rpcId: string;
  };
}

export enum ErrorCode {
  UNKNOWN = 0,
  PUBLISH = 1,
}

export enum ReplayPreset {
  LATEST = 0,
  EARLIEST = 1,
  CUSTOM = 2,
}
