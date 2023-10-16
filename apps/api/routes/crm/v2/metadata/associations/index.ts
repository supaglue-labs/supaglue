import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import type {
  CreateAssociationSchemaPathParams,
  CreateAssociationSchemaRequest,
  CreateAssociationSchemaResponse,
  GetAssociationSchemasPathParams,
  GetAssociationSchemasQueryParams,
  GetAssociationSchemasRequest,
  GetAssociationSchemasResponse,
} from '@supaglue/schemas/v2/crm';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { metadataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        GetAssociationSchemasPathParams,
        GetAssociationSchemasResponse,
        GetAssociationSchemasRequest,
        GetAssociationSchemasQueryParams
      >,
      res: Response<GetAssociationSchemasResponse>
    ) => {
      const { source_object, target_object } = req.query;

      if (!source_object && !target_object) {
        throw new BadRequestError('Missing required query params');
      }

      const associationSchemas = await metadataService.getAssociationSchemas(
        req.customerConnection.id,
        source_object,
        target_object
      );
      return res.status(200).send({ results: associationSchemas.map(snakecaseKeys) });
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateAssociationSchemaPathParams, CreateAssociationSchemaResponse, CreateAssociationSchemaRequest>,
      res: Response<CreateAssociationSchemaResponse>
    ) => {
      await metadataService.createAssociationSchema(req.customerConnection.id, {
        sourceObject: req.body.source_object,
        targetObject: req.body.target_object,
        keyName: req.body.suggested_key_name,
        displayName: req.body.display_name,
        cardinality: req.body.cardinality,
      });
      return res.status(201).send();
    }
  );
  app.use('/associations', router);
}
