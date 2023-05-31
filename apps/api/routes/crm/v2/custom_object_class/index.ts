import { getDependencyContainer } from '@/dependency_container';
import {
  CreateCustomObjectClassPathParams,
  CreateCustomObjectClassRequest,
  CreateCustomObjectClassResponse,
  GetCustomObjectClassPathParams,
  GetCustomObjectClassRequest,
  GetCustomObjectClassResponse,
  UpdateCustomObjectClassPathParams,
  UpdateCustomObjectClassRequest,
  UpdateCustomObjectClassResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';
import customObject from './custom_object';

const { crmCustomObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const customObjectClassRouter = Router();

  customObjectClassRouter.post(
    '/',
    async (
      req: Request<CreateCustomObjectClassPathParams, CreateCustomObjectClassResponse, CreateCustomObjectClassRequest>,
      res: Response<CreateCustomObjectClassResponse>
    ) => {
      const id = await crmCustomObjectService.createClass(req.customerConnection.id, camelcaseKeys(req.body.class));
      return res.status(201).send({ class: { id } });
    }
  );

  customObjectClassRouter.get(
    '/:custom_object_class_id',
    async (
      req: Request<GetCustomObjectClassPathParams, GetCustomObjectClassResponse, GetCustomObjectClassRequest>,
      res: Response<GetCustomObjectClassResponse>
    ) => {
      const customObjectClass = await crmCustomObjectService.getClass(
        req.customerConnection.id,
        req.params.custom_object_class_id
      );
      return res.status(200).send(snakecaseKeys(customObjectClass));
    }
  );

  customObjectClassRouter.put(
    '/:custom_object_class_id',
    async (
      req: Request<UpdateCustomObjectClassPathParams, UpdateCustomObjectClassResponse, UpdateCustomObjectClassRequest>,
      res: Response<UpdateCustomObjectClassResponse>
    ) => {
      await crmCustomObjectService.updateClass(req.customerConnection.id, {
        id: req.params.custom_object_class_id,
        ...camelcaseKeys(req.body.class),
      });
      return res.status(204).send();
    }
  );

  app.use('/custom-object-classes', customObjectClassRouter);

  const perCustomObjectClassRouter = Router({ mergeParams: true });

  customObject(perCustomObjectClassRouter);
  customObjectClassRouter.use('/:custom_object_class_id', perCustomObjectClassRouter);
}
