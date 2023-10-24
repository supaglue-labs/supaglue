import type { operations } from '../gen/v2/metadata';

export type ListStandardObjectsPathParams = never;
export type ListStandardObjectsQueryParams = never;
export type ListStandardObjectsRequest = never;
export type ListStandardObjectsResponse =
  operations['listStandardObjects']['responses'][keyof operations['listStandardObjects']['responses']]['content']['application/json'];

export type ListCustomObjectsPathParams = never;
export type ListCustomObjectsQueryParams = never;
export type ListCustomObjectsRequest = never;
export type ListCustomObjectsResponse =
  operations['listCustomObjects']['responses'][keyof operations['listCustomObjects']['responses']]['content']['application/json'];

export type ListPropertiesDeprecatedPathParams = never;
export type ListPropertiesDeprecatedRequest = never;
export type ListPropertiesDeprecatedQueryParams = Required<
  operations['listPropertiesDeprecated']
>['parameters']['query'];
export type ListPropertiesDeprecatedResponse =
  operations['listPropertiesDeprecated']['responses'][keyof operations['listPropertiesDeprecated']['responses']]['content']['application/json'];

export type ListPropertiesPathParams = Required<operations['listPropertiesPreview']>['parameters']['path'];
export type ListPropertiesRequest = never;
export type ListPropertiesQueryParams = never;
export type ListPropertiesResponse =
  operations['listPropertiesPreview']['responses'][keyof operations['listPropertiesPreview']['responses']]['content']['application/json'];

export type GetPropertiesPathParams = Required<operations['getProperty']>['parameters']['path'];
export type GetPropertiesRequest = never;
export type GetPropertiesQueryParams = never;
export type GetPropertiesResponse =
  operations['getProperty']['responses'][keyof operations['getProperty']['responses']]['content']['application/json'];

export type CreatePropertiesPathParams = Required<operations['createProperty']>['parameters']['path'];
export type CreatePropertiesRequest = Required<
  operations['createProperty']
>['requestBody']['content']['application/json'];
export type CreatePropertiesQueryParams = never;
export type CreatePropertiesResponse =
  operations['createProperty']['responses'][keyof operations['createProperty']['responses']]['content']['application/json'];

export type UpdatePropertiesPathParams = Required<operations['updateProperty']>['parameters']['path'];
export type UpdatePropertiesRequest = Required<
  operations['updateProperty']
>['requestBody']['content']['application/json'];
export type UpdatePropertiesQueryParams = never;
export type UpdatePropertiesResponse =
  operations['updateProperty']['responses'][keyof operations['updateProperty']['responses']]['content']['application/json'];

export type RegisterPropertiesPathParams = Required<operations['registerProperty']>['parameters']['path'];
export type RegisterPropertiesRequest = Required<
  operations['registerProperty']
>['requestBody']['content']['application/json'];
export type RegisterPropertiesQueryParams = never;
export type RegisterPropertiesResponse =
  operations['registerProperty']['responses'][keyof operations['registerProperty']['responses']]['content']['application/json'];
