import { getDependencyContainer } from '@/dependency_container';
import {
  CreateCustomObjectRecordPathParams,
  CreateCustomObjectRecordRequest,
  CreateCustomObjectRecordResponse,
  GetCustomObjectRecordPathParams,
  GetCustomObjectRecordRequest,
  GetCustomObjectRecordResponse,
  UpdateCustomObjectRecordPathParams,
  UpdateCustomObjectRecordRequest,
  UpdateCustomObjectRecordResponse,
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
      req: Request<
        CreateCustomObjectRecordPathParams,
        CreateCustomObjectRecordResponse,
        CreateCustomObjectRecordRequest
      >,
      res: Response<CreateCustomObjectRecordResponse>
    ) => {
      const id = await crmCustomObjectService.createRecord(req.customerConnection.id, {
        objectId: req.params.custom_object_id,
        ...camelcaseKeysSansFields(req.body.record),
      });
      return res.status(201).send({ record: { id } });
    }
  );

  customObjectRouter.get(
    '/:custom_object_id',
    async (
      req: Request<GetCustomObjectRecordPathParams, GetCustomObjectRecordResponse, GetCustomObjectRecordRequest>,
      res: Response<GetCustomObjectRecordResponse>
    ) => {
      const record = await crmCustomObjectService.getRecord(
        req.customerConnection.id,
        req.params.custom_object_id,
        req.params.record_id
      );
      return res.status(200).send(snakecaseKeysSansFields(record));
    }
  );

  customObjectRouter.patch(
    '/:custom_object_id',
    async (
      req: Request<
        UpdateCustomObjectRecordPathParams,
        UpdateCustomObjectRecordResponse,
        UpdateCustomObjectRecordRequest
      >,
      res: Response<UpdateCustomObjectRecordResponse>
    ) => {
      await crmCustomObjectService.updateRecord(req.customerConnection.id, {
        id: req.params.custom_object_id,
        objectId: req.params.custom_object_id,
        ...camelcaseKeysSansFields(req.body.record),
      });
      return res.status(204).send();
    }
  );

  app.use('/custom-objects', customObjectRouter);
}
