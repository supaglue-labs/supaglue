import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateEntityPathParams,
  CreateEntityRequest,
  CreateEntityResponse,
  DeleteEntityPathParams,
  DeleteEntityRequest,
  DeleteEntityResponse,
  GetEntitiesPathParams,
  GetEntitiesRequest,
  GetEntitiesResponse,
  GetEntityPathParams,
  GetEntityRequest,
  GetEntityResponse,
  UpdateEntityPathParams,
  UpdateEntityRequest,
  UpdateEntityResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { entityService } = getDependencyContainer();

export default function init(app: Router): void {
  const entityRouter = Router({ mergeParams: true });

  entityRouter.get(
    '/',
    async (
      req: Request<GetEntitiesPathParams, GetEntitiesResponse, GetEntitiesRequest>,
      res: Response<GetEntitiesResponse>
    ) => {
      const entities = await entityService.list(req.supaglueApplication.id);
      return res.status(200).send(entities.map(snakecaseKeys));
    }
  );

  entityRouter.get(
    '/:entity_id',
    async (
      req: Request<GetEntityPathParams, GetEntityResponse, GetEntityRequest>,
      res: Response<GetEntityResponse>
    ) => {
      const entity = await entityService.getById(req.params.entity_id);
      return res.status(200).send(snakecaseKeys(entity));
    }
  );

  entityRouter.post(
    '/',
    async (
      req: Request<CreateEntityPathParams, CreateEntityResponse, CreateEntityRequest>,
      res: Response<CreateEntityResponse>
    ) => {
      const entity = await entityService.create({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(entity));
    }
  );

  entityRouter.put(
    '/:entity_id',
    async (
      req: Request<UpdateEntityPathParams, UpdateEntityResponse, UpdateEntityRequest>,
      res: Response<UpdateEntityResponse>
    ) => {
      const entity = await entityService.update(req.params.entity_id, req.supaglueApplication.id, {
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(entity));
    }
  );

  entityRouter.delete(
    '/:entity_id',
    async (
      req: Request<DeleteEntityPathParams, DeleteEntityResponse, DeleteEntityRequest>,
      res: Response<DeleteEntityResponse>
    ) => {
      // TODO: Allow this when we actually clean up associated entity mappings
      // when an entity is deleted.
      throw new Error('Not implemented');
    }
  );

  app.use('/entities', entityRouter);
}
