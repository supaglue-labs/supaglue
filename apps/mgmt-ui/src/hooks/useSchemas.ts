import type { GetSchemasResponse } from '@supaglue/schemas/v2/mgmt';
import type { Schema } from '@supaglue/types';
import { camelcaseKeys, snakecaseKeys } from '@supaglue/utils';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSchemas() {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<GetSchemasResponse>('/api/internal/schemas');

  return {
    schemas: data ? data.map(camelcaseKeys) : undefined,
    isLoading,
    error,
    ...rest,
  };
}

export const toGetSchemasResponse = (schemas: Schema[]): GetSchemasResponse => {
  return schemas.map(snakecaseKeys);
};
