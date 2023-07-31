import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateStandardObjectRecordPathParams,
  CreateStandardObjectRecordRequest,
  CreateStandardObjectRecordResponse,
  GetStandardObjectRecordPathParams,
  GetStandardObjectRecordRequest,
  GetStandardObjectRecordResponse,
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
      return res.status(200).send(snakecaseKeys(record));
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

  app.use('/objects', objectRouter);
}
