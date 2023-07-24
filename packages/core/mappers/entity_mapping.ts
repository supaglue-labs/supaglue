import type { Entity } from '@supaglue/types/entity';
import type { EntityMapping, MergedEntityMapping } from '@supaglue/types/entity_mapping';

export function mergeEntityMappings(
  providerEntityMapping: EntityMapping | undefined,
  connectionEntityMapping: EntityMapping | undefined
): EntityMapping | undefined {
  if (
    providerEntityMapping &&
    connectionEntityMapping &&
    providerEntityMapping.entityId !== connectionEntityMapping.entityId
  ) {
    throw new Error('Entity mappings must be for the same entity');
  }

  let mergedEntityMapping: EntityMapping | undefined = undefined;

  for (const entityMapping of [providerEntityMapping, connectionEntityMapping]) {
    if (!entityMapping) {
      continue;
    }

    if (!mergedEntityMapping) {
      mergedEntityMapping = {
        entityId: entityMapping.entityId,
        object: entityMapping.object,
        fieldMappings: entityMapping.fieldMappings,
      };
    } else {
      mergedEntityMapping.object = entityMapping.object;

      for (const mapping of entityMapping.fieldMappings ?? []) {
        const existingMapping = mergedEntityMapping.fieldMappings?.find((m) => m.entityField === mapping.entityField);
        if (existingMapping) {
          existingMapping.mappedField = mapping.mappedField;
        } else {
          if (mergedEntityMapping.fieldMappings) {
            mergedEntityMapping.fieldMappings.push(mapping);
          } else {
            mergedEntityMapping.fieldMappings = [mapping];
          }
        }
      }
    }
  }

  return mergedEntityMapping;
}

/**
 * Given all the entities, provider entity mappings, and connection entity mappings,
 * return a list of MergedEntityMapping that contains all entities, and the associated merged
 * entity mappings for the entities that indeed have some mapping.
 */
export function mergeEntityMappingsList(
  entities: Entity[],
  providerEntityMappings: EntityMapping[],
  connectionEntityMappings: EntityMapping[]
): MergedEntityMapping[] {
  // Start off with a skeleton
  const mergedEntityMappings: MergedEntityMapping[] = entities.map((entity) => ({
    entityId: entity.id,
    entityName: entity.name,
    fieldMappings: entity.config.fields.map((field) => ({
      entityField: field.name,
      isAdditional: false,
    })),
  }));

  for (const [entityMappings, from] of [
    [providerEntityMappings, 'developer'] as const,
    [connectionEntityMappings, 'customer'] as const,
  ]) {
    for (const mapping of entityMappings) {
      const existingEntityMapping = mergedEntityMappings.find((m) => m.entityId === mapping.entityId);
      // TODO: we should probably remove entity mappings if an entity gets deleted
      if (!existingEntityMapping) {
        continue;
      }

      existingEntityMapping.object = mapping.object
        ? {
            ...mapping.object,
            from,
          }
        : undefined;

      if (mapping.fieldMappings) {
        for (const fieldMapping of mapping.fieldMappings) {
          const existingFieldMapping = existingEntityMapping.fieldMappings.find(
            (m) => m.entityField === fieldMapping.entityField
          );
          if (existingFieldMapping) {
            existingFieldMapping.mappedField = fieldMapping.mappedField;
            existingFieldMapping.from = from;
          } else {
            // TODO: Only allow this if `allowAdditionalFieldMappings` is true
            // But if we do that, then we hide additional field mappings that
            // have been defined, which may cause issues...
            existingEntityMapping.fieldMappings.push({
              ...fieldMapping,
              from,
              isAdditional: true,
            });
          }
        }
      }
    }
  }

  return mergedEntityMappings;
}
