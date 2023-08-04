import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import type {
  CreateCustomObjectPathParams,
  CreateCustomObjectRequest,
  CreateCustomObjectResponse,
  GetCustomObjectPathParams,
  GetCustomObjectRequest,
  GetCustomObjectResponse,
  ListCustomObjectsPathParams,
  ListCustomObjectsRequest,
  ListCustomObjectsResponse,
  ListStandardObjectsPathParams,
  ListStandardObjectsRequest,
  ListStandardObjectsResponse,
  UpdateCustomObjectPathParams,
  UpdateCustomObjectRequest,
  UpdateCustomObjectResponse,
} from '@supaglue/schemas/v2/metadata';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { metadataService } = getDependencyContainer();

export default function init(app: Router): void {
  const objectRouter = Router();

  objectRouter.use(connectionHeaderMiddleware);

  objectRouter.get(
    '/standard',
    async (
      req: Request<ListStandardObjectsPathParams, ListStandardObjectsResponse, ListStandardObjectsRequest>,
      res: Response<ListStandardObjectsResponse>
    ) => {
      const standardObjects = await metadataService.listStandardObjects(req.customerConnection.id);
      return res.status(200).send(standardObjects.map((name) => ({ name })));
    }
  );

  objectRouter.get(
    '/custom',
    async (
      req: Request<ListCustomObjectsPathParams, ListCustomObjectsResponse, ListCustomObjectsRequest>,
      res: Response<ListCustomObjectsResponse>
    ) => {
      const customObjects = await metadataService.listCustomObjects(req.customerConnection.id);
      return res.status(200).send(customObjects);
    }
  );

  objectRouter.post(
    '/custom',
    async (
      req: Request<CreateCustomObjectPathParams, CreateCustomObjectResponse, CreateCustomObjectRequest>,
      res: Response<CreateCustomObjectResponse>
    ) => {
      const { suggestedName, ...rest } = camelcaseKeys(req.body.object);
      const id = await metadataService.createCustomObject(req.customerConnection.id, {
        name: suggestedName,
        ...rest,
      });
      return res.status(201).send({ object: { id } });
    }
  );

  objectRouter.get(
    '/custom/:custom_object_id',
    async (
      req: Request<GetCustomObjectPathParams, GetCustomObjectResponse, GetCustomObjectRequest>,
      res: Response<GetCustomObjectResponse>
    ) => {
      const customObject = await metadataService.getCustomObject(
        req.customerConnection.id,
        req.params.custom_object_id
      );
      return res.status(200).send(snakecaseKeys(customObject));
    }
  );

  objectRouter.put(
    '/custom/:custom_object_id',
    async (
      req: Request<UpdateCustomObjectPathParams, UpdateCustomObjectResponse, UpdateCustomObjectRequest>,
      res: Response<UpdateCustomObjectResponse>
    ) => {
      const { suggestedName, ...rest } = camelcaseKeys(req.body.object);
      await metadataService.updateCustomObject(req.customerConnection.id, {
        id: req.params.custom_object_id,
        name: suggestedName,
        ...rest,
      });
      return res.status(204).send();
    }
  );

  app.use('/objects', objectRouter);
}
