import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
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

const { objectRecordService, managedDataService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/:object_name/records',
    async (
      req: Request<
        ListCustomObjectRecordsPathParams,
        ListCustomObjectRecordsResponse,
        ListCustomObjectRecordsRequest,
        ListCustomObjectRecordsQueryParams
      >,
      res: Response<ListCustomObjectRecordsResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not supported for standard object list reads.');
      }
      const { pagination, records } = await managedDataService.getCustomObjectRecords(
        req.supaglueApplication.id,
        req.customerConnection.providerName,
        req.customerId,
        req.params.object_name,
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      return res.status(200).send({
        pagination,
        records: records.map((record) => ({
          id: record._supaglue_id,
          custom_object_name: req.params.object_name,
          data: record._supaglue_raw_data,
        })),
      });
    }
  );

  router.get(
    '/:object_name/records/:record_id',
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
    '/:object_name/records',
    async (
      req: Request<
        CreateCustomObjectRecordPathParams,
        CreateCustomObjectRecordResponse,
        CreateCustomObjectRecordRequest
      >,
      res: Response<CreateCustomObjectRecordResponse>
    ) => {
      const { id } = await objectRecordService.createCustomObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.body.record
      );
      return res.status(201).send({ record: { id } });
    }
  );

  router.patch(
    '/:object_name/records/:record_id',
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

  app.use('/custom_objects', router);
}
