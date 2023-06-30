//
// Salesforce Pub/Sub API Version 1.

// @generated by protoc-gen-connect-es v0.11.0 with parameter "target=ts"
// @generated from file pubsub_api.proto (package eventbus.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { MethodKind } from '@bufbuild/protobuf';
import {
  FetchRequest,
  FetchResponse,
  PublishRequest,
  PublishResponse,
  SchemaInfo,
  SchemaRequest,
  TopicInfo,
  TopicRequest,
} from './pubsub_api_pb.js';

/**
 *
 * The Pub/Sub API provides a single interface for publishing and subscribing to platform events, including real-time
 * event monitoring events, and change data capture events. The Pub/Sub API is a gRPC API that is based on HTTP/2.
 *
 * A session token is needed to authenticate. Any of the Salesforce supported
 * OAuth flows can be used to obtain a session token:
 * https://help.salesforce.com/articleView?id=sf.remoteaccess_oauth_flows.htm&type=5
 *
 * For each RPC, a client needs to pass authentication information
 * as metadata headers (https://www.grpc.io/docs/guides/concepts/#metadata) with their method call.
 *
 * For Salesforce session token authentication, use:
 *   accesstoken : access token
 *   instanceurl : Salesforce instance URL
 *   tenantid : tenant/org id of the client
 *
 * StatusException is thrown in case of response failure for any request.
 *
 * @generated from service eventbus.v1.PubSub
 */
export const PubSub = {
  typeName: 'eventbus.v1.PubSub',
  methods: {
    /**
     *
     * Bidirectional streaming RPC to subscribe to a Topic. The subscription is pull-based. A client can request
     * for more events as it consumes events. This enables a client to handle flow control based on the client's processing speed.
     *
     * Typical flow:
     * 1. Client requests for X number of events via FetchRequest.
     * 2. Server receives request and delivers events until X events are delivered to the client via one or more FetchResponse messages.
     * 3. Client consumes the FetchResponse messages as they come.
     * 4. Client issues new FetchRequest for Y more number of events. This request can
     *    come before the server has delivered the earlier requested X number of events
     *    so the client gets a continuous stream of events if any.
     *
     * If a client requests more events before the server finishes the last
     * requested amount, the server appends the new amount to the current amount of
     * events it still needs to fetch and deliver.
     *
     * A client can subscribe at any point in the stream by providing a replay option in the first FetchRequest.
     * The replay option is honored for the first FetchRequest received from a client. Any subsequent FetchRequests with a
     * new replay option are ignored. A client needs to call the Subscribe RPC again to restart the subscription
     * at a new point in the stream.
     *
     * The first FetchRequest of the stream identifies the topic to subscribe to.
     * If any subsequent FetchRequest provides topic_name, it must match what
     * was provided in the first FetchRequest; otherwise, the RPC returns an error
     * with INVALID_ARGUMENT status.
     *
     * @generated from rpc eventbus.v1.PubSub.Subscribe
     */
    subscribe: {
      name: 'Subscribe',
      I: FetchRequest,
      O: FetchResponse,
      kind: MethodKind.BiDiStreaming,
    },
    /**
     * Get the event schema for a topic based on a schema ID.
     *
     * @generated from rpc eventbus.v1.PubSub.GetSchema
     */
    getSchema: {
      name: 'GetSchema',
      I: SchemaRequest,
      O: SchemaInfo,
      kind: MethodKind.Unary,
    },
    /**
     *
     * Get the topic Information related to the specified topic.
     *
     * @generated from rpc eventbus.v1.PubSub.GetTopic
     */
    getTopic: {
      name: 'GetTopic',
      I: TopicRequest,
      O: TopicInfo,
      kind: MethodKind.Unary,
    },
    /**
     *
     * Send a publish request to synchronously publish events to a topic.
     *
     * @generated from rpc eventbus.v1.PubSub.Publish
     */
    publish: {
      name: 'Publish',
      I: PublishRequest,
      O: PublishResponse,
      kind: MethodKind.Unary,
    },
    /**
     *
     * Bidirectional Streaming RPC to publish events to the event bus.
     * PublishRequest contains the batch of events to publish.
     *
     * The first PublishRequest of the stream identifies the topic to publish on.
     * If any subsequent PublishRequest provides topic_name, it must match what
     * was provided in the first PublishRequest; otherwise, the RPC returns an error
     * with INVALID_ARGUMENT status.
     *
     * The server returns a PublishResponse for each PublishRequest when publish is
     * complete for the batch. A client does not have to wait for a PublishResponse
     * before sending a new PublishRequest, i.e. multiple publish batches can be queued
     * up, which allows for higher publish rate as a client can asynchronously
     * publish more events while publishes are still in flight on the server side.
     *
     * PublishResponse holds a PublishResult for each event published that indicates success
     * or failure of the publish. A client can then retry the publish as needed before sending
     * more PublishRequests for new events to publish.
     *
     * A client must send a valid publish request with one or more events every 70 seconds to hold on to the stream.
     * Otherwise, the server closes the stream and notifies the client. Once the client is notified of the stream closure,
     * it must make a new PublishStream call to resume publishing.
     *
     * @generated from rpc eventbus.v1.PubSub.PublishStream
     */
    publishStream: {
      name: 'PublishStream',
      I: PublishRequest,
      O: PublishResponse,
      kind: MethodKind.BiDiStreaming,
    },
  },
} as const;
