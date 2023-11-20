import type { operations, paths } from '../gen/v2/marketing-automation';

export type SubmitFormPathParams = paths['/forms/{form_id}/_submit']['parameters']['path'];
export type SubmitFormQueryParams = never;
export type SubmitFormRequest = operations['submitForm']['requestBody']['content']['application/json'];
export type SubmitFormResponse =
  operations['submitForm']['responses'][keyof operations['submitForm']['responses']]['content']['application/json'];
export type SubmitFormSuccessfulResponse = operations['submitForm']['responses']['200']['content']['application/json'];
export type SubmitFormFailureResponse = Exclude<SubmitFormResponse, SubmitFormSuccessfulResponse>;

export type ListFormsPathParams = never;
export type ListFormsQueryParams = Required<operations['listForms']>['parameters']['query'];
export type ListFormsRequest = never;
export type ListFormsResponse =
  operations['listForms']['responses'][keyof operations['listForms']['responses']]['content']['application/json'];
export type ListFormsSuccessfulResponse = operations['listForms']['responses']['200']['content']['application/json'];
export type ListFormsFailureResponse = Exclude<ListFormsResponse, ListFormsSuccessfulResponse>;

export type GetFormFieldsPathParams = paths['/forms/{form_id}/_fields']['parameters']['path'];
export type GetFormFieldsQueryParams = Required<operations['getFormFields']>['parameters']['query'];
export type GetFormFieldsRequest = never;
export type GetFormFieldsResponse =
  operations['getFormFields']['responses'][keyof operations['getFormFields']['responses']]['content']['application/json'];
export type GetFormFieldsSuccessfulResponse =
  operations['getFormFields']['responses']['200']['content']['application/json'];
export type GetFormFieldsFailureResponse = Exclude<GetFormFieldsResponse, GetFormFieldsSuccessfulResponse>;
