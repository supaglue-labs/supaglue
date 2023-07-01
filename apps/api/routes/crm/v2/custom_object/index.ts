import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateCustomObjectPathParams,
  CreateCustomObjectRequest,
  CreateCustomObjectResponse,
  GetCustomObjectPathParams,
  GetCustomObjectRequest,
  GetCustomObjectResponse,
  UpdateCustomObjectPathParams,
  UpdateCustomObjectRequest,
  UpdateCustomObjectResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';
import customObject from './record';

const { crmCustomObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const customObjectRouter = Router();

  customObjectRouter.post(
    '/',
    async (
      req: Request<CreateCustomObjectPathParams, CreateCustomObjectResponse, CreateCustomObjectRequest>,
      res: Response<CreateCustomObjectResponse>
    ) => {
      const id = await crmCustomObjectService.createObject(req.customerConnection.id, camelcaseKeys(req.body.object));
      return res.status(201).send({ object: { id } });
    }
  );

  customObjectRouter.get(
    '/:custom_object_id',
    async (
      req: Request<GetCustomObjectPathParams, GetCustomObjectResponse, GetCustomObjectRequest>,
      res: Response<GetCustomObjectResponse>
    ) => {
      const customObject = await crmCustomObjectService.getObject(
        req.customerConnection.id,
        req.params.custom_object_id
      );
      return res.status(200).send(snakecaseKeys(customObject));
    }
  );

  customObjectRouter.put(
    '/:custom_object_id',
    async (
      req: Request<UpdateCustomObjectPathParams, UpdateCustomObjectResponse, UpdateCustomObjectRequest>,
      res: Response<UpdateCustomObjectResponse>
    ) => {
      await crmCustomObjectService.updateObject(req.customerConnection.id, {
        id: req.params.custom_object_id,
        ...camelcaseKeys(req.body.object),
      });
      return res.status(204).send();
    }
  );

  app.use('/custom-objects', customObjectRouter);

  const perCustomObjectRouter = Router({ mergeParams: true });

  customObject(perCustomObjectRouter);
  customObjectRouter.use('/:custom_object_id', perCustomObjectRouter);
}
