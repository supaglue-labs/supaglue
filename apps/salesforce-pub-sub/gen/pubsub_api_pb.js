//
// Salesforce Pub/Sub API Version 1.

// @generated by protoc-gen-es v1.2.0
// @generated from file pubsub_api.proto (package eventbus.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { proto3 } from "@bufbuild/protobuf";

/**
 * Supported error codes
 *
 * @generated from enum eventbus.v1.ErrorCode
 */
export const ErrorCode = proto3.makeEnum(
  "eventbus.v1.ErrorCode",
  [
    {no: 0, name: "UNKNOWN"},
    {no: 1, name: "PUBLISH"},
  ],
);

/**
 *
 * Supported subscription replay start values.
 * By default, the subscription will start at the tip of the stream if ReplayPreset is not specified.
 *
 * @generated from enum eventbus.v1.ReplayPreset
 */
export const ReplayPreset = proto3.makeEnum(
  "eventbus.v1.ReplayPreset",
  [
    {no: 0, name: "LATEST"},
    {no: 1, name: "EARLIEST"},
    {no: 2, name: "CUSTOM"},
  ],
);

/**
 *
 * Contains information about a topic and uniquely identifies it. TopicInfo is returned by the GetTopic RPC method.
 *
 * @generated from message eventbus.v1.TopicInfo
 */
export const TopicInfo = proto3.makeMessageType(
  "eventbus.v1.TopicInfo",
  () => [
    { no: 1, name: "topic_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "tenant_guid", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "can_publish", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 4, name: "can_subscribe", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 5, name: "schema_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 6, name: "rpc_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 *
 * A request message for GetTopic. Note that the tenant/org is not directly referenced
 * in the request, but is implicitly identified by the authentication headers.
 *
 * @generated from message eventbus.v1.TopicRequest
 */
export const TopicRequest = proto3.makeMessageType(
  "eventbus.v1.TopicRequest",
  () => [
    { no: 1, name: "topic_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 *
 * Reserved for future use.
 * Header that contains information for distributed tracing, filtering, routing, etc.
 * For example, X-B3-* headers assigned by a publisher are stored with the event and
 * can provide a full distributed trace of the event across its entire lifecycle.
 *
 * @generated from message eventbus.v1.EventHeader
 */
export const EventHeader = proto3.makeMessageType(
  "eventbus.v1.EventHeader",
  () => [
    { no: 1, name: "key", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "value", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
  ],
);

/**
 *
 * Represents an event that an event publishing app creates.
 *
 * @generated from message eventbus.v1.ProducerEvent
 */
export const ProducerEvent = proto3.makeMessageType(
  "eventbus.v1.ProducerEvent",
  () => [
    { no: 1, name: "id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "schema_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "payload", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
    { no: 4, name: "headers", kind: "message", T: EventHeader, repeated: true },
  ],
);

/**
 *
 * Represents an event that is consumed in a subscriber client.
 * In addition to the fields in ProducerEvent, ConsumerEvent has the replay_id field.
 *
 * @generated from message eventbus.v1.ConsumerEvent
 */
export const ConsumerEvent = proto3.makeMessageType(
  "eventbus.v1.ConsumerEvent",
  () => [
    { no: 1, name: "event", kind: "message", T: ProducerEvent },
    { no: 2, name: "replay_id", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
  ],
);

/**
 *
 * Event publish result that the Publish RPC method returns. The result contains replay_id or a publish error.
 *
 * @generated from message eventbus.v1.PublishResult
 */
export const PublishResult = proto3.makeMessageType(
  "eventbus.v1.PublishResult",
  () => [
    { no: 1, name: "replay_id", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
    { no: 2, name: "error", kind: "message", T: Error },
    { no: 3, name: "correlationKey", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * Contains error information for an error that an RPC method returns.
 *
 * @generated from message eventbus.v1.Error
 */
export const Error = proto3.makeMessageType(
  "eventbus.v1.Error",
  () => [
    { no: 1, name: "code", kind: "enum", T: proto3.getEnumType(ErrorCode) },
    { no: 2, name: "msg", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 *
 * Request for the Subscribe streaming RPC method. This request is used to:
 * 1. Establish the initial subscribe stream.
 * 2. Request more events from the subscription stream.
 * Flow Control is handled by the subscriber via num_requested.
 * A client can specify a starting point for the subscription with replay_preset and replay_id combinations.
 * If no replay_preset is specified, the subscription starts at LATEST (tip of the stream).
 * replay_preset and replay_id values are only consumed as part of the first FetchRequest. If
 * a client needs to start at another point in the stream, it must start a new subscription.
 *
 * @generated from message eventbus.v1.FetchRequest
 */
export const FetchRequest = proto3.makeMessageType(
  "eventbus.v1.FetchRequest",
  () => [
    { no: 1, name: "topic_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "replay_preset", kind: "enum", T: proto3.getEnumType(ReplayPreset) },
    { no: 3, name: "replay_id", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
    { no: 4, name: "num_requested", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
    { no: 5, name: "auth_refresh", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 *
 * Response for the Subscribe streaming RPC method. This returns ConsumerEvent(s).
 * If there are no events to deliver, the server sends an empty batch fetch response with the latest replay ID. The
 * empty fetch response is sent within 270 seconds. An empty fetch response provides a periodic keepalive from the
 * server and the latest replay ID.
 *
 * @generated from message eventbus.v1.FetchResponse
 */
export const FetchResponse = proto3.makeMessageType(
  "eventbus.v1.FetchResponse",
  () => [
    { no: 1, name: "events", kind: "message", T: ConsumerEvent, repeated: true },
    { no: 2, name: "latest_replay_id", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
    { no: 3, name: "rpc_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "pending_num_requested", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
  ],
);

/**
 *
 * Request for the GetSchema RPC method. The schema request is based on the event schema ID.
 *
 * @generated from message eventbus.v1.SchemaRequest
 */
export const SchemaRequest = proto3.makeMessageType(
  "eventbus.v1.SchemaRequest",
  () => [
    { no: 1, name: "schema_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 *
 * Response for the GetSchema RPC method. This returns the schema ID and schema of an event.
 *
 * @generated from message eventbus.v1.SchemaInfo
 */
export const SchemaInfo = proto3.makeMessageType(
  "eventbus.v1.SchemaInfo",
  () => [
    { no: 1, name: "schema_json", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "schema_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "rpc_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * Request for the Publish and PublishStream RPC method.
 *
 * @generated from message eventbus.v1.PublishRequest
 */
export const PublishRequest = proto3.makeMessageType(
  "eventbus.v1.PublishRequest",
  () => [
    { no: 1, name: "topic_name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "events", kind: "message", T: ProducerEvent, repeated: true },
    { no: 3, name: "auth_refresh", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 *
 * Response for the Publish and PublishStream RPC methods. This returns
 * a list of PublishResults for each event that the client attempted to
 * publish. PublishResult indicates if publish succeeded or not
 * for each event. It also returns the schema ID that was used to create
 * the ProducerEvents in the PublishRequest.
 *
 * @generated from message eventbus.v1.PublishResponse
 */
export const PublishResponse = proto3.makeMessageType(
  "eventbus.v1.PublishResponse",
  () => [
    { no: 1, name: "results", kind: "message", T: PublishResult, repeated: true },
    { no: 2, name: "schema_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "rpc_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

