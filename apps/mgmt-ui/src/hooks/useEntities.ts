import type { GetEntitiesResponse } from '@supaglue/schemas/v2/mgmt';
import type { Entity } from '@supaglue/types/entity';
import { camelcaseKeys, snakecaseKeys } from '@supaglue/utils';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useEntities() {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<GetEntitiesResponse>('/api/internal/entities');

  return {
    entities: data ? data.map(camelcaseKeys) : undefined,
    isLoading,
    error,
    ...rest,
  };
}

export const toGetEntitiesResponse = (entities: Entity[]): GetEntitiesResponse => {
  return entities.map(snakecaseKeys);
};
