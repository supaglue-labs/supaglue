import { getDependencyContainer } from '@/dependency_container';
import { toSnakecaseKeysEntityRecord } from '@supaglue/core/mappers/entity_record';
import type {
  CreateEntityRecordPathParams,
  CreateEntityRecordRequest,
  CreateEntityRecordResponse,
  GetEntityRecordPathParams,
  GetEntityRecordRequest,
  GetEntityRecordResponse,
  UpdateEntityRecordPathParams,
  UpdateEntityRecordRequest,
  UpdateEntityRecordResponse,
} from '@supaglue/schemas/v2/actions';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { entityRecordService } = getDependencyContainer();

export default function init(app: Router): void {
  const entityRouter = Router();

  entityRouter.post(
    '/:entity_name',
    async (
      req: Request<CreateEntityRecordPathParams, CreateEntityRecordResponse, CreateEntityRecordRequest>,
      res: Response<CreateEntityRecordResponse>
    ) => {
      const record = await entityRecordService.createEntityRecord(
        req.customerConnection,
        req.params.entity_name,
        req.body.data
      );
      return res.status(201).send({ record });
    }
  );

  entityRouter.get(
    '/:entity_name/:record_id',
    async (
      req: Request<GetEntityRecordPathParams, GetEntityRecordResponse, GetEntityRecordRequest>,
      res: Response<GetEntityRecordResponse>
    ) => {
      const record = await entityRecordService.getEntityRecord(
        req.customerConnection,
        req.params.entity_name,
        req.params.record_id
      );
      return res.status(200).send(toSnakecaseKeysEntityRecord(record));
    }
  );

  entityRouter.patch(
    '/:entity_name/:record_id',
    async (
      req: Request<UpdateEntityRecordPathParams, UpdateEntityRecordResponse, UpdateEntityRecordRequest>,
      res: Response<UpdateEntityRecordResponse>
    ) => {
      await entityRecordService.updateEntityRecord(
        req.customerConnection,
        req.params.entity_name,
        req.params.record_id,
        req.body.data
      );
      return res.status(204).send();
    }
  );

  app.use('/entities', entityRouter);
}
