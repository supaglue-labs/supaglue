import type { operations, paths } from '../gen/v2/marketing-automation';

export type SubmitFormPathParams = paths['/forms/{form_id}/_submit']['parameters']['path'];
export type SubmitFormQueryParams = never;
export type SubmitFormRequest = operations['submitForm']['requestBody']['content']['application/json'];
export type SubmitFormResponse =
  operations['submitForm']['responses'][keyof operations['submitForm']['responses']]['content']['application/json'];
