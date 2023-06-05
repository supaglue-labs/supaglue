import type { operations, paths } from '../gen/v2/engagement';

export type SendPassthroughRequestPathParams = any;
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type SendPassthroughRequestQueryParams = Required<operations['getUser']>['parameters']['query'];
export type SendPassthroughRequestQueryParams = any;
export type SendPassthroughRequestRequest =
  operations['sendPassthroughRequest']['requestBody']['content']['application/json'];
export type SendPassthroughRequestResponse =
  operations['sendPassthroughRequest']['responses'][keyof operations['sendPassthroughRequest']['responses']]['content']['application/json'];

export type CreateContactPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateContactQueryParams = Required<operations['createContact']>['parameters']['query'];
export type CreateContactQueryParams = any;
export type CreateContactRequest = operations['createContact']['requestBody']['content']['application/json'];
export type CreateContactResponse =
  operations['createContact']['responses'][keyof operations['createContact']['responses']]['content']['application/json'];

export type GetContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type GetContactQueryParams = any;
export type GetContactRequest = never;
export type GetContactResponse =
  operations['getContact']['responses'][keyof operations['getContact']['responses']]['content']['application/json'];

export type UpdateContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type UpdateContactQueryParams = any;
export type UpdateContactRequest = operations['updateContact']['requestBody']['content']['application/json'];
export type UpdateContactResponse =
  operations['updateContact']['responses'][keyof operations['updateContact']['responses']]['content']['application/json'];

export type GetUserPathParams = paths[`/users/{user_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserQueryParams = any;
export type GetUserRequest = never;
export type GetUserResponse =
  operations['getUser']['responses'][keyof operations['getUser']['responses']]['content']['application/json'];

export type GetSequencePathParams = paths[`/sequences/{sequence_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetSequenceQueryParams = Required<operations['getSequence']>['parameters']['query'];
export type GetSequenceQueryParams = any;
export type GetSequenceRequest = never;
export type GetSequenceResponse =
  operations['getSequence']['responses'][keyof operations['getSequence']['responses']]['content']['application/json'];

export type GetMailboxPathParams = paths[`/mailboxes/{mailbox_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetMailboxQueryParams = Required<operations['getMailbox']>['parameters']['query'];
export type GetMailboxQueryParams = any;
export type GetMailboxRequest = never;
export type GetMailboxResponse =
  operations['getMailbox']['responses'][keyof operations['getMailbox']['responses']]['content']['application/json'];

export type GetSequenceStatePathParams = paths[`/sequence_states/{sequence_state_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetSequenceStateQueryParams = Required<operations['getSequenceState']>['parameters']['query'];
export type GetSequenceStateQueryParams = any;
export type GetSequenceStateRequest = never;
export type GetSequenceStateResponse =
  operations['getSequenceState']['responses'][keyof operations['getSequenceState']['responses']]['content']['application/json'];

export type CreateSequenceStatePathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateSequenceStateQueryParams = Required<operations['createSequenceState']>['parameters']['query'];
export type CreateSequenceStateQueryParams = any;
export type CreateSequenceStateRequest =
  operations['createSequenceState']['requestBody']['content']['application/json'];
export type CreateSequenceStateResponse =
  operations['createSequenceState']['responses'][keyof operations['createSequenceState']['responses']]['content']['application/json'];
