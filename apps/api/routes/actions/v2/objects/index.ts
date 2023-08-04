import { getDependencyContainer } from '@/dependency_container';
import {
  toSnakecaseKeysCustomObjectRecord,
  toSnakecaseKeysStandardObjectRecord,
} from '@supaglue/core/mappers/object_record';
import type {
  CreateCustomObjectRecordPathParams,
  CreateCustomObjectRecordRequest,
  CreateCustomObjectRecordResponse,
  CreateStandardObjectRecordPathParams,
  CreateStandardObjectRecordRequest,
  CreateStandardObjectRecordResponse,
  GetCustomObjectRecordPathParams,
  GetCustomObjectRecordRequest,
  GetCustomObjectRecordResponse,
  GetStandardObjectRecordPathParams,
  GetStandardObjectRecordRequest,
  GetStandardObjectRecordResponse,
  UpdateCustomObjectRecordPathParams,
  UpdateCustomObjectRecordRequest,
  UpdateCustomObjectRecordResponse,
  UpdateStandardObjectRecordPathParams,
  UpdateStandardObjectRecordRequest,
  UpdateStandardObjectRecordResponse,
} from '@supaglue/schemas/v2/actions';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { objectRecordService } = getDependencyContainer();

export default function init(app: Router): void {
  const objectRouter = Router();

  objectRouter.post(
    '/standard/:object_name',
    async (
      req: Request<
        CreateStandardObjectRecordPathParams,
        CreateStandardObjectRecordResponse,
        CreateStandardObjectRecordRequest
      >,
      res: Response<CreateStandardObjectRecordResponse>
    ) => {
      const record = await objectRecordService.createStandardObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.body.data
      );
      return res.status(201).send({ record: snakecaseKeys(record) });
    }
  );

  objectRouter.get(
    '/standard/:object_name/:record_id',
    async (
      req: Request<GetStandardObjectRecordPathParams, GetStandardObjectRecordResponse, GetStandardObjectRecordRequest>,
      res: Response<GetStandardObjectRecordResponse>
    ) => {
      const record = await objectRecordService.getStandardObjectRecord(
        req.customerConnection,
        req.params.object_name,
        req.params.record_id
      );
      return res.status(200).send(toSnakecaseKeysStandardObjectRecord(record));
    }
  );

  objectRouter.patch(
    '/standard/:object_name/:record_id',
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
        req.body.data
      );
      return res.status(204).send();
    }
  );

  objectRouter.post(
    '/custom/:object_id',
    async (
      req: Request<
        CreateCustomObjectRecordPathParams,
        CreateCustomObjectRecordResponse,
        CreateCustomObjectRecordRequest
      >,
      res: Response<CreateCustomObjectRecordResponse>
    ) => {
      const record = await objectRecordService.createCustomObjectRecord(
        req.customerConnection,
        req.params.object_id,
        req.body.data
      );
      return res.status(201).send({ record: snakecaseKeys(record) });
    }
  );

  objectRouter.get(
    '/custom/:object_id/:record_id',
    async (
      req: Request<GetCustomObjectRecordPathParams, GetCustomObjectRecordResponse, GetCustomObjectRecordRequest>,
      res: Response<GetCustomObjectRecordResponse>
    ) => {
      const record = await objectRecordService.getCustomObjectRecord(
        req.customerConnection,
        req.params.object_id,
        req.params.record_id
      );
      return res.status(200).send(toSnakecaseKeysCustomObjectRecord(record));
    }
  );

  objectRouter.patch(
    '/custom/:object_id/:record_id',
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
        req.params.object_id,
        req.params.record_id,
        req.body.data
      );
      return res.status(204).send();
    }
  );

  app.use('/objects', objectRouter);
}
