import type { operations, paths } from '../gen/v2/marketing-automation';

export type SubmitFormPathParams = paths['/forms/{form_id}/_submit']['parameters']['path'];
export type SubmitFormQueryParams = never;
export type SubmitFormRequest = operations['submitForm']['requestBody']['content']['application/json'];
export type SubmitFormResponse =
  operations['submitForm']['responses'][keyof operations['submitForm']['responses']]['content']['application/json'];

export type ListFormsPathParams = never;
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type ListFormsQueryParams = Required<operations['listForms']>['parameters']['query'];
export type ListFormsQueryParams = any;
export type ListFormsRequest = never;
export type ListFormsResponse =
  operations['listForms']['responses'][keyof operations['listForms']['responses']]['content']['application/json'];

export type GetFormFieldsPathParams = paths['/forms/{form_id}/_fields']['parameters']['path'];
// TODO - this should be generated from the openapi spec, but it's not getting generated due to a bug in openapi-typescript
// export type GetFormFieldsQueryParams = Required<operations['getFormFields']>['parameters']['query'];
export type GetFormFieldsQueryParams = any;
export type GetFormFieldsRequest = never;
export type GetFormFieldsResponse =
  operations['getFormFields']['responses'][keyof operations['getFormFields']['responses']]['content']['application/json'];
