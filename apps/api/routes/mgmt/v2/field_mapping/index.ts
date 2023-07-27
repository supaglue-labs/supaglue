import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import { getFieldMappingInfo } from '@supaglue/core/services';
import type {
  ListFieldMappingsPathParams,
  ListFieldMappingsRequest,
  ListFieldMappingsResponse,
  UpdateObjectFieldMappingsPathParams,
  UpdateObjectFieldMappingsRequest,
  UpdateObjectFieldMappingsResponse,
} from '@supaglue/schemas/v2/mgmt';
import type { ObjectFieldMappingInfo, ProviderObject, Schema, SchemaMappingsConfigForObject } from '@supaglue/types';
import type { ObjectType } from '@supaglue/types/sync';
import { camelcaseKeys, snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { connectionService, providerService, schemaService } = getDependencyContainer();

export default function init(app: Router): void {
  const fieldMappingsRouter = Router({ mergeParams: true });
  fieldMappingsRouter.use(connectionHeaderMiddleware);

  fieldMappingsRouter.get(
    '/',
    async (
      req: Request<ListFieldMappingsPathParams, ListFieldMappingsResponse, ListFieldMappingsRequest>,
      res: Response<ListFieldMappingsResponse>
    ) => {
      if (req.customerConnection.category !== 'crm') {
        throw new BadRequestError('Only CRM connections are supported for this operation');
      }
      const { objects } = await providerService.getById(req.customerConnection.providerId);
      const schemaIds = [
        ...(objects?.common?.flatMap((object) => object.schemaId ?? []) ?? []),
        ...(objects?.standard?.flatMap((object) => object.schemaId ?? []) ?? []),
        ...(objects?.custom?.flatMap((object) => object.schemaId ?? []) ?? []),
      ];
      const schemas = await schemaService.getByIds(schemaIds);
      const out = [
        ...getObjectFieldMappingInfo(
          (objects?.common ?? []) as ProviderObject[],
          schemas,
          'common',
          req.customerConnection.schemaMappingsConfig?.commonObjects
        ),
        ...getObjectFieldMappingInfo(
          objects?.standard ?? [],
          schemas,
          'standard',
          req.customerConnection.schemaMappingsConfig?.standardObjects
        ),
        // TODO: Also support custom objects
      ];
      return res.status(200).send(out.map(snakecaseKeys));
    }
  );

  fieldMappingsRouter.put(
    '/_update_object',
    async (
      req: Request<
        UpdateObjectFieldMappingsPathParams,
        UpdateObjectFieldMappingsResponse,
        UpdateObjectFieldMappingsRequest
      >,
      res: Response<UpdateObjectFieldMappingsResponse>
    ) => {
      if (req.customerConnection.category !== 'crm') {
        throw new BadRequestError('Only CRM connections are supported for this operation');
      }
      const info = await connectionService.updateObjectFieldMapping(req.customerConnection, camelcaseKeys(req.body));
      return res.status(200).send(snakecaseKeys(info));
    }
  );

  app.use('/field_mappings', fieldMappingsRouter);
}

const getObjectFieldMappingInfo = (
  providerObjects: ProviderObject[],
  schemas: Schema[],
  type: ObjectType,
  schemaMappingsConfigForObject?: SchemaMappingsConfigForObject[]
): ObjectFieldMappingInfo[] => {
  return providerObjects.flatMap((object) => {
    const schema = schemas.find((schema) => schema.id === object.schemaId);
    if (!schema) {
      return [];
    }
    const fieldMappings = schemaMappingsConfigForObject?.find(
      (mapping) => mapping.object === object.name
    )?.fieldMappings;
    return {
      objectName: object.name,
      objectType: type,
      allowAdditionalFieldMappings: schema.config.allowAdditionalFieldMappings,
      schemaId: schema.id,
      fields: getFieldMappingInfo(schema, fieldMappings),
    };
  });
};
