import { getDependencyContainer } from '@/dependency_container';
import {
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
import { camelcaseKeysSansFields } from '@supaglue/utils/camelcase';
import { snakecaseKeysSansFields } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { crmCustomObjectService } = getDependencyContainer();

export default function init(app: Router): void {
  const customObjectRouter = Router({ mergeParams: true });

  customObjectRouter.post(
    '/',
    async (
      req: Request<CreateCustomObjectPathParams, CreateCustomObjectResponse, CreateCustomObjectRequest>,
      res: Response<CreateCustomObjectResponse>
    ) => {
      const id = await crmCustomObjectService.createObject(req.customerConnection.id, {
        classId: req.params.custom_object_class_id,
        ...camelcaseKeysSansFields(req.body.model),
      });
      return res.status(201).send({ model: { id } });
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
        req.params.custom_object_class_id,
        req.params.custom_object_id
      );
      return res.status(200).send(snakecaseKeysSansFields(customObject));
    }
  );

  customObjectRouter.patch(
    '/:custom_object_id',
    async (
      req: Request<UpdateCustomObjectPathParams, UpdateCustomObjectResponse, UpdateCustomObjectRequest>,
      res: Response<UpdateCustomObjectResponse>
    ) => {
      await crmCustomObjectService.updateObject(req.customerConnection.id, {
        id: req.params.custom_object_id,
        classId: req.params.custom_object_class_id,
        ...camelcaseKeysSansFields(req.body.model),
      });
      return res.status(204).send();
    }
  );

  app.use('/custom-objects', customObjectRouter);
}
