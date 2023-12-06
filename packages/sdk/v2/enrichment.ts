import type { operations, paths } from '../gen/v2/enrichment';

export type EnrichPersonPathParams = never;
export type EnrichPersonQueryParams = paths['/persons']['parameters']['query'];
export type EnrichPersonRequest = never;
export type EnrichPersonResponse =
  operations['enrichPerson']['responses'][keyof operations['enrichPerson']['responses']]['content']['application/json'];
export type EnrichPersonSuccessfulResponse =
  operations['enrichPerson']['responses']['200']['content']['application/json'];
export type EnrichPersonFailureResponse = Exclude<EnrichPersonResponse, EnrichPersonSuccessfulResponse>;
