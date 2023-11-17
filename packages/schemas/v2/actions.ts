import type { operations } from '../gen/v2/actions';

export type SendPassthroughRequestPathParams = any;
export type SendPassthroughRequestQueryParams = any;
export type SendPassthroughRequestRequest =
  operations['sendPassthroughRequest']['requestBody']['content']['application/json'];
export type SendPassthroughRequestResponse =
  operations['sendPassthroughRequest']['responses'][200]['content']['application/json'];
