import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import type {
  DeleteEntityMappingPathParams,
  DeleteEntityMappingRequest,
  DeleteEntityMappingResponse,
  ListEntityMappingsPathParams,
  ListEntityMappingsRequest,
  ListEntityMappingsResponse,
  UpsertEntityMappingPathParams,
  UpsertEntityMappingRequest,
  UpsertEntityMappingResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const entityMappingRouter = Router({ mergeParams: true });
  entityMappingRouter.use(connectionHeaderMiddleware);

  entityMappingRouter.get(
    '/',
    async (
      req: Request<ListEntityMappingsPathParams, ListEntityMappingsResponse, ListEntityMappingsRequest>,
      res: Response<ListEntityMappingsResponse>
    ) => {
      const mergedEntityMappings = await connectionService.listMergedEntityMappings(req.customerConnection.id);
      return res.status(200).send(mergedEntityMappings.map(snakecaseKeys));
    }
  );

  entityMappingRouter.put(
    '/:entity_id',
    async (
      req: Request<UpsertEntityMappingPathParams, UpsertEntityMappingResponse, UpsertEntityMappingRequest>,
      res: Response<UpsertEntityMappingResponse>
    ) => {
      // TODO: shouldn't be asking user to pass in `entity_id` in both path and body
      await connectionService.upsertEntityMapping(req.customerConnection.id, req.body.entity_id, {
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send();
    }
  );

  entityMappingRouter.delete(
    '/:entity_id',
    async (
      req: Request<DeleteEntityMappingPathParams, DeleteEntityMappingResponse, DeleteEntityMappingRequest>,
      res: Response<DeleteEntityMappingResponse>
    ) => {
      await connectionService.deleteEntityMapping(req.customerConnection.id, req.params.entity_id);
      return res.status(204).end();
    }
  );

  app.use('/entity_mappings', entityMappingRouter);
}
