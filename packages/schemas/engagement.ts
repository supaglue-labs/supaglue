import type { operations, paths } from './gen/engagement';

export type SendPassthroughRequestPathParams = any;
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type SendPassthroughRequestQueryParams = Required<operations['getUser']>['parameters']['query'];
export type SendPassthroughRequestQueryParams = any;
export type SendPassthroughRequestRequest =
  operations['sendPassthroughRequest']['requestBody']['content']['application/json'];
export type SendPassthroughRequestResponse =
  operations['sendPassthroughRequest']['responses'][keyof operations['sendPassthroughRequest']['responses']]['content']['application/json'];

export type GetContactsPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetContactsQueryParams = Required<operations['getContacts']>['parameters']['query'];
export type GetContactsQueryParams = any;
export type GetContactsRequest = never;
export type GetContactsResponse =
  operations['getContacts']['responses'][keyof operations['getContacts']['responses']]['content']['application/json'];

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
