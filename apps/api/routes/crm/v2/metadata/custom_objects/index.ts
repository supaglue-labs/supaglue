import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateCustomObjectSchemaPathParams,
  CreateCustomObjectSchemaRequest,
  CreateCustomObjectSchemaResponse,
  GetCustomObjectSchemaPathParams,
  GetCustomObjectSchemaRequest,
  GetCustomObjectSchemaResponse,
  ListCustomObjectSchemasPathParams,
  ListCustomObjectSchemasRequest,
  ListCustomObjectSchemasResponse,
  UpdateCustomObjectSchemaPathParams,
  UpdateCustomObjectSchemaRequest,
  UpdateCustomObjectSchemaResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { metadataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<ListCustomObjectSchemasPathParams, ListCustomObjectSchemasResponse, ListCustomObjectSchemasRequest>,
      res: Response<ListCustomObjectSchemasResponse>
    ) => {
      const customObjects = await metadataService.listCustomObjectSchemas(req.customerConnection.id);
      return res.status(200).send(customObjects);
    }
  );

  router.post(
    '/',
    async (
      req: Request<
        CreateCustomObjectSchemaPathParams,
        CreateCustomObjectSchemaResponse,
        CreateCustomObjectSchemaRequest
      >,
      res: Response<CreateCustomObjectSchemaResponse>
    ) => {
      const name = await metadataService.createCustomObjectSchema(
        req.customerConnection.id,
        camelcaseKeys(req.body.object)
      );
      return res.status(201).send({ object: { name } });
    }
  );

  router.get(
    '/:object_name',
    async (
      req: Request<GetCustomObjectSchemaPathParams, GetCustomObjectSchemaResponse, GetCustomObjectSchemaRequest>,
      res: Response<GetCustomObjectSchemaResponse>
    ) => {
      const customObject = await metadataService.getCustomObjectSchema(
        req.customerConnection.id,
        req.params.object_name
      );
      return res.status(200).send(snakecaseKeys(customObject));
    }
  );

  router.put(
    '/:object_name',
    async (
      req: Request<
        UpdateCustomObjectSchemaPathParams,
        UpdateCustomObjectSchemaResponse,
        UpdateCustomObjectSchemaRequest
      >,
      res: Response<UpdateCustomObjectSchemaResponse>
    ) => {
      await metadataService.updateCustomObjectSchema(req.customerConnection.id, {
        ...camelcaseKeys(req.body.object),
        name: req.params.object_name,
      });
      return res.status(204).end();
    }
  );
  app.use('/custom_objects', router);
}
