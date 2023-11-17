import type { operations } from '../gen/v2/metadata';

export type ListStandardObjectsPathParams = never;
export type ListStandardObjectsQueryParams = never;
export type ListStandardObjectsRequest = never;
export type ListStandardObjectsResponse =
  operations['listStandardObjects']['responses'][200]['content']['application/json'];

export type ListCustomObjectsPathParams = never;
export type ListCustomObjectsQueryParams = never;
export type ListCustomObjectsRequest = never;
export type ListCustomObjectsResponse =
  operations['listCustomObjects']['responses'][200]['content']['application/json'];

export type ListPropertiesDeprecatedPathParams = never;
export type ListPropertiesDeprecatedRequest = never;
export type ListPropertiesDeprecatedQueryParams = Required<
  operations['listPropertiesDeprecated']
>['parameters']['query'];
export type ListPropertiesDeprecatedResponse =
  operations['listPropertiesDeprecated']['responses'][200]['content']['application/json'];
