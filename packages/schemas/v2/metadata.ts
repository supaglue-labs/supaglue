import type { operations, paths } from '../gen/v2/metadata';

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

export type CreateCustomObjectPathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateCustomObjectQueryParams = Required<operations['createCustomObject']>['parameters']['query'];
export type CreateCustomObjectQueryParams = any;
export type CreateCustomObjectRequest = operations['createCustomObject']['requestBody']['content']['application/json'];
export type CreateCustomObjectResponse =
  operations['createCustomObject']['responses'][keyof operations['createCustomObject']['responses']]['content']['application/json'];

export type GetCustomObjectPathParams = paths[`/objects/custom/{custom_object_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetCustomObjectQueryParams = Required<operations['GetCustomObjectQueryParams']>['parameters']['query'];
export type GetCustomObjectQueryParams = any;
export type GetCustomObjectRequest = never;
export type GetCustomObjectResponse =
  operations['getCustomObject']['responses'][keyof operations['getCustomObject']['responses']]['content']['application/json'];

export type UpdateCustomObjectPathParams = paths[`/objects/custom/{custom_object_id}`]['parameters']['path'];
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type UpdateCustomObjectQueryParams = Required<operations['updateCustomObject']>['parameters']['query'];
export type UpdateCustomObjectQueryParams = any;
export type UpdateCustomObjectRequest = operations['updateCustomObject']['requestBody']['content']['application/json'];
export type UpdateCustomObjectResponse =
  operations['updateCustomObject']['responses'][keyof operations['updateCustomObject']['responses']]['content']['application/json'];

export type GetAssociationTypesPathParams = never;
export type GetAssociationTypesQueryParams = Required<
  Required<operations['getAssociationTypes']>['parameters']
>['query'];
export type GetAssociationTypesRequest = never;
export type GetAssociationTypesResponse =
  operations['getAssociationTypes']['responses'][keyof operations['getAssociationTypes']['responses']]['content']['application/json'];

export type CreateAssociationTypePathParams = never;
// TODO - this should be generated from the openapi spec , but it's not getting generated due to a bug in openapi-typescript
// export type CreateAssociationTypeQueryParams = Required<operations['createAssociationType']>['parameters']['query'];
export type CreateAssociationTypeQueryParams = any;
export type CreateAssociationTypeRequest =
  operations['createAssociationType']['requestBody']['content']['application/json'];
export type CreateAssociationTypeResponse =
  operations['createAssociationType']['responses'][keyof operations['createAssociationType']['responses']]['content']['application/json'];

export type ListPropertiesPathParams = never;
export type ListPropertiesRequest = never;
export type ListPropertiesQueryParams = Required<operations['listPropertiesDeprecated']>['parameters']['query'];
export type ListPropertiesResponse =
  operations['listPropertiesDeprecated']['responses'][keyof operations['listPropertiesDeprecated']['responses']]['content']['application/json'];
