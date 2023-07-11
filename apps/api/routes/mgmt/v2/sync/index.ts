import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import { toPaginationInternalParams } from '@supaglue/core/lib';
import type {
  GetSyncsPathParams,
  GetSyncsQueryParams,
  GetSyncsRequest,
  GetSyncsResponse,
  TriggerSyncPathParams,
  TriggerSyncQueryParams,
  TriggerSyncRequest,
  TriggerSyncResponse,
} from '@supaglue/schemas/v2/mgmt';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { objectSyncService, connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router) {
  const syncRouter = Router();
  syncRouter.use(connectionHeaderMiddleware);

  syncRouter.get(
    '/',
    async (
      req: Request<GetSyncsPathParams, GetSyncsResponse, GetSyncsRequest, GetSyncsQueryParams>,
      res: Response<GetSyncsResponse>
    ) => {
      function getObjectFilter() {
        if (req.query?.object_type && req.query.object) {
          return {
            objectType: req.query.object_type,
            object: req.query.object,
          };
        } else if (!req.query?.object_type && !req.query?.object) {
          return {};
        }
        throw new BadRequestError('object_type and object must both be present or both be absent');
      }

      const { next, previous, results, totalCount } = await objectSyncService.list({
        connectionId: req.customerConnection.id,
        paginationParams: toPaginationInternalParams({ page_size: req.query?.page_size, cursor: req.query?.cursor }),
        ...getObjectFilter(),
      });

      const snakeCaseResults = results.map((result) => ({
        id: result.id,
        object_type: result.objectType,
        object: result.object,
        connection_id: result.connectionId,
        sync_config_id: result.syncConfigId,
      }));
      return res.status(200).send({ next, previous, results: snakeCaseResults, total_count: totalCount });
    }
  );

  syncRouter.post(
    '_trigger',
    async (
      req: Request<TriggerSyncPathParams, TriggerSyncResponse, TriggerSyncRequest, TriggerSyncQueryParams>,
      res: Response<TriggerSyncResponse>
    ) => {
      const { id } = await objectSyncService.getByConnectionIdAndObjectTypeAndObject(
        req.customerConnection.id,
        req.query.object_type,
        req.query.object
      );
      const sync = await connectionAndSyncService.triggerSync(
        req.supaglueApplication.id,
        id,
        req.body.perform_full_refresh ?? false
      );
      return res.status(200).send({
        id: sync.id,
        object_type: sync.objectType,
        object: sync.object,
        connection_id: sync.connectionId,
        sync_config_id: sync.syncConfigId,
      });
    }
  );

  app.use('/syncs', syncRouter);
}
