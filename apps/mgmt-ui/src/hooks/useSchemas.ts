import type { GetSchemasSuccessfulResponse } from '@supaglue/sdk/v2/mgmt';
import type { Schema } from '@supaglue/types';
import { camelcaseKeys, snakecaseKeys } from '@supaglue/utils';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSchemas() {
  const { data, isLoading, error, ...rest } =
    useSWRWithApplication<GetSchemasSuccessfulResponse>('/api/internal/schemas');

  return {
    schemas: data ? data.map(camelcaseKeys) : undefined,
    isLoading,
    error,
    ...rest,
  };
}

export const toGetSchemasResponse = (schemas: Schema[]): GetSchemasSuccessfulResponse => {
  return schemas.map(snakecaseKeys);
};
