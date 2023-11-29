import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import type {
  CreateStandardObjectRecordPathParams,
  CreateStandardObjectRecordRequest,
  CreateStandardObjectRecordResponse,
  GetStandardObjectRecordPathParams,
  GetStandardObjectRecordQueryParams,
  GetStandardObjectRecordRequest,
  GetStandardObjectRecordResponse,
  ListStandardObjectRecordsPathParams,
  ListStandardObjectRecordsQueryParams,
  ListStandardObjectRecordsRequest,
  ListStandardObjectRecordsResponse,
  UpdateStandardObjectRecordPathParams,
  UpdateStandardObjectRecordRequest,
  UpdateStandardObjectRecordResponse,
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
        ListStandardObjectRecordsPathParams,
        ListStandardObjectRecordsResponse,
        ListStandardObjectRecordsRequest,
        ListStandardObjectRecordsQueryParams
      >,
      res: Response<ListStandardObjectRecordsResponse>
    ) => {
      if (req.query?.read_from_cache?.toString() !== 'true') {
        throw new BadRequestError('Uncached reads not supported for standard object list reads.');
      }
      const { pagination, records } = await managedDataService.getStandardRecords(
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
          object_name: req.params.object_name,
          data: record._supaglue_raw_data,
          is_deleted: record._supaglue_is_deleted,
          last_modified_at: record._supaglue_last_modified_at,
        })),
      });
    }
  );

  router.get(
    '/:object_name/records/:record_id',
    async (
      req: Request<
        GetStandardObjectRecordPathParams,
        GetStandardObjectRecordResponse,
        GetStandardObjectRecordRequest,
        GetStandardObjectRecordQueryParams
      >,
      res: Response<GetStandardObjectRecordResponse>
    ) => {
      const record = await objectRecordService.getStandardObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.params.record_id
      );
      return res.status(200).send({
        id: record.id,
        object_name: record.objectName,
        data: record.data,
        is_deleted: record.metadata.isDeleted,
        last_modified_at: record.metadata.lastModifiedAt,
      });
    }
  );

  router.post(
    '/:object_name/records',
    async (
      req: Request<
        CreateStandardObjectRecordPathParams,
        CreateStandardObjectRecordResponse,
        CreateStandardObjectRecordRequest
      >,
      res: Response<CreateStandardObjectRecordResponse>
    ) => {
      const { id } = await objectRecordService.createStandardObjectRecord(
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
        UpdateStandardObjectRecordPathParams,
        UpdateStandardObjectRecordResponse,
        UpdateStandardObjectRecordRequest
      >,
      res: Response<UpdateStandardObjectRecordResponse>
    ) => {
      await objectRecordService.updateStandardObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.params.record_id,
        req.body.record
      );
      return res.status(201).send({ record: { id: req.params.record_id } });
    }
  );

  app.use('/standard_objects', router);
}
