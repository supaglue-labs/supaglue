import type { operations } from '../gen/v2/metadata';

export type ListStandardObjectsPathParams = never;
export type ListStandardObjectsQueryParams = never;
export type ListStandardObjectsRequest = never;
export type ListStandardObjectsResponse =
  operations['listStandardObjects']['responses'][keyof operations['listStandardObjects']['responses']]['content']['application/json'];

export type ListPropertiesPathParams = never;
export type ListPropertiesRequest = never;
export type ListPropertiesQueryParams = Required<operations['listPropertiesDeprecated']>['parameters']['query'];
export type ListPropertiesResponse =
  operations['listPropertiesDeprecated']['responses'][keyof operations['listPropertiesDeprecated']['responses']]['content']['application/json'];
