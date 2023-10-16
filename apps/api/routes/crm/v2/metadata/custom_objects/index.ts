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
  UpdateCustomObjectPathParams,
  UpdateCustomObjectRequest,
  UpdateCustomObjectResponse,
} from '@/../../packages/schemas/v2/crm';
import { camelcaseKeys } from '@/../../packages/utils/camelcase';
import { snakecaseKeys } from '@/../../packages/utils/snakecase';
import { getDependencyContainer } from '@/dependency_container';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { metadataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<ListCustomObjectsPathParams, ListCustomObjectsResponse, ListCustomObjectsRequest>,
      res: Response<ListCustomObjectsResponse>
    ) => {
      const customObjects = await metadataService.listCustomObjects(req.customerConnection.id);
      return res.status(200).send(customObjects);
    }
  );

  router.post(
    '/',
    async (
      req: Request<CreateCustomObjectPathParams, CreateCustomObjectResponse, CreateCustomObjectRequest>,
      res: Response<CreateCustomObjectResponse>
    ) => {
      const name = await metadataService.createCustomObject(req.customerConnection.id, camelcaseKeys(req.body.object));
      return res.status(201).send({ object: { name } });
    }
  );

  router.get(
    '/:object_name',
    async (
      req: Request<GetCustomObjectPathParams, GetCustomObjectResponse, GetCustomObjectRequest>,
      res: Response<GetCustomObjectResponse>
    ) => {
      const customObject = await metadataService.getCustomObject(req.customerConnection.id, req.params.object_name);
      return res.status(200).send(snakecaseKeys(customObject));
    }
  );

  router.put(
    '/:object_name',
    async (
      req: Request<UpdateCustomObjectPathParams, UpdateCustomObjectResponse, UpdateCustomObjectRequest>,
      res: Response<UpdateCustomObjectResponse>
    ) => {
      await metadataService.updateCustomObject(req.customerConnection.id, {
        ...camelcaseKeys(req.body.object),
        name: req.params.object_name,
      });
      return res.status(204).end();
    }
  );
  app.use('/custom_objects', router);
}
