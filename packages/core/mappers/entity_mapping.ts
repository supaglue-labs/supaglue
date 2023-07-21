import type { EntityMapping, MergedEntityMapping } from '@supaglue/types/entity_mapping';

export function mergeEntityMappings(
  providerEntityMapping: EntityMapping | undefined,
  connectionEntityMapping: EntityMapping | undefined
): MergedEntityMapping | undefined {
  if (providerEntityMapping) {
    if (connectionEntityMapping) {
      if (providerEntityMapping.entityId !== connectionEntityMapping.entityId) {
        throw new Error('Entity mappings must be for the same entity');
      }

      const mergedFieldMappings: MergedEntityMapping['fieldMappings'] = providerEntityMapping.fieldMappings?.map(
        (mapping) => ({
          ...mapping,
          from: 'developer',
        })
      );

      for (const mapping of connectionEntityMapping.fieldMappings ?? []) {
        const existingMapping = mergedFieldMappings?.find((m) => m.entityField === mapping.entityField);
        if (existingMapping) {
          existingMapping.mappedField = mapping.mappedField;
          existingMapping.from = 'customer';
        } else {
          mergedFieldMappings?.push({
            ...mapping,
            from: 'customer',
          });
        }
      }

      return {
        entityId: providerEntityMapping.entityId,
        object: connectionEntityMapping.object
          ? {
              ...connectionEntityMapping.object,
              from: 'customer',
            }
          : providerEntityMapping.object
          ? {
              ...providerEntityMapping.object,
              from: 'developer',
            }
          : undefined,
        fieldMappings: mergedFieldMappings,
      };
    } else {
      return {
        entityId: providerEntityMapping.entityId,
        object: providerEntityMapping.object
          ? {
              ...providerEntityMapping.object,
              from: 'developer',
            }
          : undefined,
        fieldMappings: providerEntityMapping.fieldMappings?.map((mapping) => ({
          ...mapping,
          from: 'developer',
        })),
      };
    }
  } else {
    if (connectionEntityMapping) {
      return {
        entityId: connectionEntityMapping.entityId,
        object: connectionEntityMapping.object
          ? {
              ...connectionEntityMapping.object,
              from: 'customer',
            }
          : undefined,
        fieldMappings: connectionEntityMapping.fieldMappings?.map((mapping) => ({
          ...mapping,
          from: 'customer',
        })),
      };
    } else {
      return undefined;
    }
  }
}

export function mergeEntityMappingsList(
  providerEntityMappings: EntityMapping[],
  connectionEntityMappings: EntityMapping[]
): MergedEntityMapping[] {
  const mergedEntityMappings: MergedEntityMapping[] = [];

  for (const providerEntityMapping of providerEntityMappings) {
    const connectionEntityMapping = connectionEntityMappings.find(
      (mapping) => mapping.entityId === providerEntityMapping.entityId
    );
    if (connectionEntityMapping) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mergedEntityMappings.push(mergeEntityMappings(providerEntityMapping, connectionEntityMapping)!);
    } else {
      mergedEntityMappings.push({
        entityId: providerEntityMapping.entityId,
        object: providerEntityMapping.object
          ? {
              ...providerEntityMapping.object,
              from: 'developer',
            }
          : undefined,
        fieldMappings: providerEntityMapping.fieldMappings?.map((mapping) => ({
          ...mapping,
          from: 'developer',
        })),
      });
    }
  }

  for (const connectionEntityMapping of connectionEntityMappings) {
    const providerEntityMapping = providerEntityMappings.find(
      (mapping) => mapping.entityId === connectionEntityMapping.entityId
    );
    if (!providerEntityMapping) {
      mergedEntityMappings.push({
        entityId: connectionEntityMapping.entityId,
        object: connectionEntityMapping.object
          ? {
              ...connectionEntityMapping.object,
              from: 'customer',
            }
          : undefined,
        fieldMappings: connectionEntityMapping.fieldMappings?.map((mapping) => ({
          ...mapping,
          from: 'customer',
        })),
      });
    }
  }

  return mergedEntityMappings;
}
