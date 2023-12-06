import type { operations } from '../gen/v2/metadata';

export type ListStandardObjectsPathParams = never;
export type ListStandardObjectsQueryParams = never;
export type ListStandardObjectsRequest = never;
export type ListStandardObjectsResponse =
  operations['listStandardObjects']['responses'][keyof operations['listStandardObjects']['responses']]['content']['application/json'];
export type ListStandardObjectsSuccessfulResponse =
  operations['listStandardObjects']['responses']['200']['content']['application/json'];
export type ListStandardObjectsFailureResponse = Exclude<
  ListStandardObjectsResponse,
  ListStandardObjectsSuccessfulResponse
>;

export type ListCustomObjectsPathParams = never;
export type ListCustomObjectsQueryParams = never;
export type ListCustomObjectsRequest = never;
export type ListCustomObjectsResponse =
  operations['listCustomObjects']['responses'][keyof operations['listCustomObjects']['responses']]['content']['application/json'];
export type ListCustomObjectsSuccessfulResponse =
  operations['listCustomObjects']['responses']['200']['content']['application/json'];
export type ListCustomObjectsFailureResponse = Exclude<ListCustomObjectsResponse, ListCustomObjectsSuccessfulResponse>;

export type ListPropertiesDeprecatedPathParams = never;
export type ListPropertiesDeprecatedRequest = never;
export type ListPropertiesDeprecatedQueryParams = Required<
  operations['listPropertiesDeprecated']
>['parameters']['query'];
export type ListPropertiesDeprecatedResponse =
  operations['listPropertiesDeprecated']['responses'][keyof operations['listPropertiesDeprecated']['responses']]['content']['application/json'];
export type ListPropertiesDeprecatedSuccessfulResponse =
  operations['listPropertiesDeprecated']['responses']['200']['content']['application/json'];
export type ListPropertiesDeprecatedFailureResponse = Exclude<
  ListPropertiesDeprecatedResponse,
  ListPropertiesDeprecatedSuccessfulResponse
>;
