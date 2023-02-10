// package: eventbus.v1
// file: pubsub_api.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from '@grpc/grpc-js';
import * as pubsub_api_pb from './pubsub_api_pb';

interface IPubSubService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  subscribe: IPubSubService_ISubscribe;
  getSchema: IPubSubService_IGetSchema;
  getTopic: IPubSubService_IGetTopic;
  publish: IPubSubService_IPublish;
  publishStream: IPubSubService_IPublishStream;
}

interface IPubSubService_ISubscribe
  extends grpc.MethodDefinition<pubsub_api_pb.FetchRequest, pubsub_api_pb.FetchResponse> {
  path: '/eventbus.v1.PubSub/Subscribe';
  requestStream: true;
  responseStream: true;
  requestSerialize: grpc.serialize<pubsub_api_pb.FetchRequest>;
  requestDeserialize: grpc.deserialize<pubsub_api_pb.FetchRequest>;
  responseSerialize: grpc.serialize<pubsub_api_pb.FetchResponse>;
  responseDeserialize: grpc.deserialize<pubsub_api_pb.FetchResponse>;
}
interface IPubSubService_IGetSchema
  extends grpc.MethodDefinition<pubsub_api_pb.SchemaRequest, pubsub_api_pb.SchemaInfo> {
  path: '/eventbus.v1.PubSub/GetSchema';
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<pubsub_api_pb.SchemaRequest>;
  requestDeserialize: grpc.deserialize<pubsub_api_pb.SchemaRequest>;
  responseSerialize: grpc.serialize<pubsub_api_pb.SchemaInfo>;
  responseDeserialize: grpc.deserialize<pubsub_api_pb.SchemaInfo>;
}
interface IPubSubService_IGetTopic extends grpc.MethodDefinition<pubsub_api_pb.TopicRequest, pubsub_api_pb.TopicInfo> {
  path: '/eventbus.v1.PubSub/GetTopic';
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<pubsub_api_pb.TopicRequest>;
  requestDeserialize: grpc.deserialize<pubsub_api_pb.TopicRequest>;
  responseSerialize: grpc.serialize<pubsub_api_pb.TopicInfo>;
  responseDeserialize: grpc.deserialize<pubsub_api_pb.TopicInfo>;
}
interface IPubSubService_IPublish
  extends grpc.MethodDefinition<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse> {
  path: '/eventbus.v1.PubSub/Publish';
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<pubsub_api_pb.PublishRequest>;
  requestDeserialize: grpc.deserialize<pubsub_api_pb.PublishRequest>;
  responseSerialize: grpc.serialize<pubsub_api_pb.PublishResponse>;
  responseDeserialize: grpc.deserialize<pubsub_api_pb.PublishResponse>;
}
interface IPubSubService_IPublishStream
  extends grpc.MethodDefinition<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse> {
  path: '/eventbus.v1.PubSub/PublishStream';
  requestStream: true;
  responseStream: true;
  requestSerialize: grpc.serialize<pubsub_api_pb.PublishRequest>;
  requestDeserialize: grpc.deserialize<pubsub_api_pb.PublishRequest>;
  responseSerialize: grpc.serialize<pubsub_api_pb.PublishResponse>;
  responseDeserialize: grpc.deserialize<pubsub_api_pb.PublishResponse>;
}

export const PubSubService: IPubSubService;

export interface IPubSubServer extends grpc.UntypedServiceImplementation {
  subscribe: grpc.handleBidiStreamingCall<pubsub_api_pb.FetchRequest, pubsub_api_pb.FetchResponse>;
  getSchema: grpc.handleUnaryCall<pubsub_api_pb.SchemaRequest, pubsub_api_pb.SchemaInfo>;
  getTopic: grpc.handleUnaryCall<pubsub_api_pb.TopicRequest, pubsub_api_pb.TopicInfo>;
  publish: grpc.handleUnaryCall<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse>;
  publishStream: grpc.handleBidiStreamingCall<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse>;
}

export interface IPubSubClient {
  subscribe(): grpc.ClientDuplexStream<pubsub_api_pb.FetchRequest, pubsub_api_pb.FetchResponse>;
  subscribe(
    options: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.FetchRequest, pubsub_api_pb.FetchResponse>;
  subscribe(
    metadata: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.FetchRequest, pubsub_api_pb.FetchResponse>;
  getSchema(
    request: pubsub_api_pb.SchemaRequest,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.SchemaInfo) => void
  ): grpc.ClientUnaryCall;
  getSchema(
    request: pubsub_api_pb.SchemaRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.SchemaInfo) => void
  ): grpc.ClientUnaryCall;
  getSchema(
    request: pubsub_api_pb.SchemaRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.SchemaInfo) => void
  ): grpc.ClientUnaryCall;
  getTopic(
    request: pubsub_api_pb.TopicRequest,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.TopicInfo) => void
  ): grpc.ClientUnaryCall;
  getTopic(
    request: pubsub_api_pb.TopicRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.TopicInfo) => void
  ): grpc.ClientUnaryCall;
  getTopic(
    request: pubsub_api_pb.TopicRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.TopicInfo) => void
  ): grpc.ClientUnaryCall;
  publish(
    request: pubsub_api_pb.PublishRequest,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.PublishResponse) => void
  ): grpc.ClientUnaryCall;
  publish(
    request: pubsub_api_pb.PublishRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.PublishResponse) => void
  ): grpc.ClientUnaryCall;
  publish(
    request: pubsub_api_pb.PublishRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.PublishResponse) => void
  ): grpc.ClientUnaryCall;
  publishStream(): grpc.ClientDuplexStream<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse>;
  publishStream(
    options: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse>;
  publishStream(
    metadata: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse>;
}

export class PubSubClient extends grpc.Client implements IPubSubClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
  public subscribe(
    options?: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.FetchRequest, pubsub_api_pb.FetchResponse>;
  public subscribe(
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.FetchRequest, pubsub_api_pb.FetchResponse>;
  public getSchema(
    request: pubsub_api_pb.SchemaRequest,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.SchemaInfo) => void
  ): grpc.ClientUnaryCall;
  public getSchema(
    request: pubsub_api_pb.SchemaRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.SchemaInfo) => void
  ): grpc.ClientUnaryCall;
  public getSchema(
    request: pubsub_api_pb.SchemaRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.SchemaInfo) => void
  ): grpc.ClientUnaryCall;
  public getTopic(
    request: pubsub_api_pb.TopicRequest,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.TopicInfo) => void
  ): grpc.ClientUnaryCall;
  public getTopic(
    request: pubsub_api_pb.TopicRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.TopicInfo) => void
  ): grpc.ClientUnaryCall;
  public getTopic(
    request: pubsub_api_pb.TopicRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.TopicInfo) => void
  ): grpc.ClientUnaryCall;
  public publish(
    request: pubsub_api_pb.PublishRequest,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.PublishResponse) => void
  ): grpc.ClientUnaryCall;
  public publish(
    request: pubsub_api_pb.PublishRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.PublishResponse) => void
  ): grpc.ClientUnaryCall;
  public publish(
    request: pubsub_api_pb.PublishRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: pubsub_api_pb.PublishResponse) => void
  ): grpc.ClientUnaryCall;
  public publishStream(
    options?: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse>;
  public publishStream(
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>
  ): grpc.ClientDuplexStream<pubsub_api_pb.PublishRequest, pubsub_api_pb.PublishResponse>;
}
