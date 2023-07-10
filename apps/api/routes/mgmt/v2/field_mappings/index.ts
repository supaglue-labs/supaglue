import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import type {
  GetDestinationPathParams,
  GetDestinationRequest,
  GetDestinationResponse,
  ListFieldMappingsPathParams,
  ListFieldMappingsRequest,
  ListFieldMappingsResponse,
  ListPropertiesPathParams,
  ListPropertiesQueryParams,
  ListPropertiesRequest,
  ListPropertiesResponse,
} from '@supaglue/schemas/v2/mgmt';
import type {
  FieldMappingInfo,
  ObjectFieldMappingInfo,
  ProviderObject,
  Schema,
  SchemaMappingsConfigForObject,
  SchemaMappingsConfigObjectFieldMapping,
} from '@supaglue/types';
import { CRM_COMMON_OBJECT_TYPES } from '@supaglue/types/crm';
import type { ObjectType } from '@supaglue/types/object_sync';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { providerService, remoteService, schemaService } = getDependencyContainer();

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
          objects?.common ?? [],
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

  fieldMappingsRouter.get(
    '/properties',
    async (
      req: Request<ListPropertiesPathParams, ListPropertiesResponse, ListPropertiesRequest, ListPropertiesQueryParams>,
      res: Response<ListPropertiesResponse>
    ) => {
      if (req.customerConnection.category !== 'crm') {
        throw new BadRequestError('Only CRM connections are supported for this operation');
      }
      const client = await remoteService.getCrmRemoteClient(req.customerConnection.id);
      const { type, name } = req.query;
      if (type === 'common' && !(CRM_COMMON_OBJECT_TYPES as unknown as string[]).includes(name)) {
        throw new BadRequestError(
          `${name} is not a valid common object type for the ${req.customerConnection.category} category}`
        );
      }
      const properties =
        req.query.type === 'common'
          ? await client.listCommonProperties({
              type: 'common',
              name: req.query.name,
            })
          : await client.listProperties({
              type: req.query.type,
              name: req.query.name,
            });
      return res.status(200).send({ properties });
    }
  );

  fieldMappingsRouter.put(
    '/_update_object',
    async (
      req: Request<GetDestinationPathParams, GetDestinationResponse, GetDestinationRequest>,
      res: Response<GetDestinationResponse>
    ) => {
      throw new Error('Not implemented');
    }
  );

  app.use('/field_mappings', fieldMappingsRouter);
}

const getFieldMappingInfo = (
  schema: Schema,
  fieldMappings?: SchemaMappingsConfigObjectFieldMapping[]
): FieldMappingInfo[] => {
  const out: FieldMappingInfo[] = schema.config.fields.map((field) => ({
    name: field.name,
    isAddedByCustomer: false,
    schemaMappedName: field.mappedName,
  }));

  fieldMappings?.forEach((fieldMapping) => {
    const field = out.find((field) => field.name === fieldMapping.schemaField);
    if (field && !field.schemaMappedName && fieldMapping.mappedField) {
      field.customerMappedName = fieldMapping.mappedField;
    }
    if (!field) {
      out.push({
        name: fieldMapping.schemaField,
        isAddedByCustomer: true,
        customerMappedName: fieldMapping.mappedField,
      });
    }
  });

  return out;
};

const getObjectFieldMappingInfo = (
  providerObjects: ProviderObject[],
  schemas: Schema[],
  type: ObjectType,
  schemaMappingsConfigForObject?: SchemaMappingsConfigForObject[]
): ObjectFieldMappingInfo[] => {
  const out: ObjectFieldMappingInfo[] = [];
  providerObjects.flatMap((object) => {
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
  return out;
};
