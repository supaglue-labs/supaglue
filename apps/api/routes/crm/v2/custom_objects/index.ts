import { getDependencyContainer } from '@/dependency_container';
import { NotImplementedError } from '@supaglue/core/errors';
import type {
  CreateCustomObjectRecordPathParams,
  CreateCustomObjectRecordRequest,
  CreateCustomObjectRecordResponse,
  GetCustomObjectRecordPathParams,
  GetCustomObjectRecordQueryParams,
  GetCustomObjectRecordRequest,
  GetCustomObjectRecordResponse,
  ListCustomObjectRecordsPathParams,
  ListCustomObjectRecordsQueryParams,
  ListCustomObjectRecordsRequest,
  ListCustomObjectRecordsResponse,
  UpdateCustomObjectRecordPathParams,
  UpdateCustomObjectRecordRequest,
  UpdateCustomObjectRecordResponse,
} from '@supaglue/schemas/v2/crm';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { objectRecordService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<
        ListCustomObjectRecordsPathParams,
        ListCustomObjectRecordsResponse,
        ListCustomObjectRecordsRequest,
        ListCustomObjectRecordsQueryParams
      >,
      res: Response<ListCustomObjectRecordsResponse>
    ) => {
      throw new NotImplementedError();
    }
  );

  router.get(
    '/:record_id',
    async (
      req: Request<
        GetCustomObjectRecordPathParams,
        GetCustomObjectRecordResponse,
        GetCustomObjectRecordRequest,
        GetCustomObjectRecordQueryParams
      >,
      res: Response<GetCustomObjectRecordResponse>
    ) => {
      const record = await objectRecordService.getCustomObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.params.record_id
      );
      return res.status(200).send({ id: record.id, custom_object_name: record.objectName, data: record.data });
    }
  );

  router.post(
    '/',
    async (
      req: Request<
        CreateCustomObjectRecordPathParams,
        CreateCustomObjectRecordResponse,
        CreateCustomObjectRecordRequest
      >,
      res: Response<CreateCustomObjectRecordResponse>
    ) => {
      const id = await objectRecordService.createCustomObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.body.record
      );
      return res.status(201).send({ record: { id } });
    }
  );

  router.patch(
    '/:record_id',
    async (
      req: Request<
        UpdateCustomObjectRecordPathParams,
        UpdateCustomObjectRecordResponse,
        UpdateCustomObjectRecordRequest
      >,
      res: Response<UpdateCustomObjectRecordResponse>
    ) => {
      await objectRecordService.updateCustomObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.params.record_id,
        req.body.record
      );
      return res.status(201).send({ record: { id: req.params.record_id } });
    }
  );

  app.use('/custom_objects/:object_name/records', router);
}
