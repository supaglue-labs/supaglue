import { getDependencyContainer } from '@/dependency_container';
import {
  CreateSchemaPathParams,
  CreateSchemaRequest,
  CreateSchemaResponse,
  DeleteSchemaPathParams,
  DeleteSchemaRequest,
  DeleteSchemaResponse,
  GetSchemaPathParams,
  GetSchemaRequest,
  GetSchemaResponse,
  GetSchemasPathParams,
  GetSchemasRequest,
  GetSchemasResponse,
  UpdateSchemaPathParams,
  UpdateSchemaRequest,
  UpdateSchemaResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { schemaService } = getDependencyContainer();

export default function init(app: Router): void {
  const schemaRouter = Router({ mergeParams: true });

  schemaRouter.get(
    '/',
    async (
      req: Request<GetSchemasPathParams, GetSchemasResponse, GetSchemasRequest>,
      res: Response<GetSchemasResponse>
    ) => {
      const schemas = await schemaService.list(req.supaglueApplication.id);
      return res.status(200).send(schemas.map(snakecaseKeys));
    }
  );

  schemaRouter.get(
    '/:schema_id',
    async (
      req: Request<GetSchemaPathParams, GetSchemaResponse, GetSchemaRequest>,
      res: Response<GetSchemaResponse>
    ) => {
      const schema = await schemaService.getById(req.params.schema_id);
      return res.status(200).send(snakecaseKeys(schema));
    }
  );

  schemaRouter.post(
    '/',
    async (
      req: Request<CreateSchemaPathParams, CreateSchemaResponse, CreateSchemaRequest>,
      res: Response<CreateSchemaResponse>
    ) => {
      const schema = await schemaService.create({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(schema));
    }
  );

  schemaRouter.put(
    '/:schema_id',
    async (
      req: Request<UpdateSchemaPathParams, UpdateSchemaResponse, UpdateSchemaRequest>,
      res: Response<UpdateSchemaResponse>
    ) => {
      const schema = await schemaService.update(req.params.schema_id, {
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(schema));
    }
  );

  schemaRouter.delete(
    '/:schema_id',
    async (
      req: Request<DeleteSchemaPathParams, DeleteSchemaResponse, DeleteSchemaRequest>,
      res: Response<DeleteSchemaResponse>
    ) => {
      throw new Error('Schema deletion is not yet implemented');
    }
  );

  app.use('/schemas', schemaRouter);
}
