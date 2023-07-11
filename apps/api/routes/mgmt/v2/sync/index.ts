import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import { toPaginationInternalParams } from '@supaglue/core/lib';
import type {
  GetSyncsPathParams,
  GetSyncsQueryParams,
  GetSyncsRequest,
  GetSyncsResponse,
  PauseSyncPathParams,
  PauseSyncQueryParams,
  PauseSyncRequest,
  PauseSyncResponse,
  ResumeSyncPathParams,
  ResumeSyncQueryParams,
  ResumeSyncRequest,
  ResumeSyncResponse,
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
        paused: result.paused,
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
      const objectSync = await objectSyncService.getByConnectionIdAndObjectTypeAndObject(
        req.customerConnection.id,
        req.query.object_type,
        req.query.object
      );
      const updated = await connectionAndSyncService.triggerSync(objectSync, req.body.perform_full_refresh ?? false);
      return res.status(200).send({
        id: updated.id,
        object_type: updated.objectType,
        object: updated.object,
        connection_id: updated.connectionId,
        sync_config_id: updated.syncConfigId,
        paused: updated.paused,
      });
    }
  );

  syncRouter.post(
    '_pause',
    async (
      req: Request<PauseSyncPathParams, PauseSyncResponse, PauseSyncRequest, PauseSyncQueryParams>,
      res: Response<PauseSyncResponse>
    ) => {
      const objectSync = await objectSyncService.getByConnectionIdAndObjectTypeAndObject(
        req.customerConnection.id,
        req.query.object_type,
        req.query.object
      );
      const updated = await connectionAndSyncService.pauseSync(objectSync);
      return res.status(200).send({
        id: updated.id,
        object_type: updated.objectType,
        object: updated.object,
        connection_id: updated.connectionId,
        sync_config_id: updated.syncConfigId,
        paused: updated.paused,
      });
    }
  );

  syncRouter.post(
    '_resume',
    async (
      req: Request<ResumeSyncPathParams, ResumeSyncResponse, ResumeSyncRequest, ResumeSyncQueryParams>,
      res: Response<ResumeSyncResponse>
    ) => {
      const objectSync = await objectSyncService.getByConnectionIdAndObjectTypeAndObject(
        req.customerConnection.id,
        req.query.object_type,
        req.query.object
      );
      const updated = await connectionAndSyncService.resumeSync(objectSync);
      return res.status(200).send({
        id: updated.id,
        object_type: updated.objectType,
        object: updated.object,
        connection_id: updated.connectionId,
        sync_config_id: updated.syncConfigId,
        paused: updated.paused,
      });
    }
  );

  app.use('/syncs', syncRouter);
}
