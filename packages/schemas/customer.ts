import type { operations } from './gen/customer';

export type GetSyncInfosPathParams = any;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetSyncInfosQueryParams = Required<operations['getSyncInfos']>['parameters']['query'];
export type GetSyncInfosQueryParams = any;
export type GetSyncInfosRequest = never;
export type GetSyncInfosResponse =
  operations['getSyncInfos']['responses'][keyof operations['getSyncInfos']['responses']]['content']['application/json'];

export type GetSyncHistoryPathParams = any;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type GetSyncHistoryQueryParams = Required<operations['getSyncHistory']>['parameters']['query'];
export type GetSyncHistoryQueryParams = any;
export type GetSyncHistoryRequest = never;
export type GetSyncHistoryResponse =
  operations['getSyncHistory']['responses'][keyof operations['getSyncHistory']['responses']]['content']['application/json'];
