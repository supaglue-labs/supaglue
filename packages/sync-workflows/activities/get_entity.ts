import type { EntityService } from '@supaglue/core/services/entity_service';
import type { Entity } from '@supaglue/types/entity';

export type GetEntityArgs = {
  entityId: string;
};

export type GetEntityResult = {
  entity: Entity;
};

export function createGetEntity(entityService: EntityService) {
  return async function getEntity({ entityId }: GetEntityArgs): Promise<GetEntityResult> {
    const entity = await entityService.getById(entityId);
    return {
      entity,
    };
  };
}
