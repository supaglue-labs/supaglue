import type { operations, paths } from '../gen/v2/enrichment';

export type EnrichPersonPathParams = never;
export type EnrichPersonQueryParams = paths['/persons']['parameters']['query'];
export type EnrichPersonRequest = never;
export type EnrichPersonResponse =
  operations['enrichPerson']['responses'][keyof operations['enrichPerson']['responses']]['content']['application/json'];
