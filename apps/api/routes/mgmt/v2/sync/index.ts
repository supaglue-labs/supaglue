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

const { syncService, connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router) {
  const syncRouter = Router();
  const syncRouterWithConnectionMiddleware = Router();
  syncRouterWithConnectionMiddleware.use(connectionHeaderMiddleware);

  syncRouter.get(
    '/',
    async (
      req: Request<GetSyncsPathParams, GetSyncsResponse, GetSyncsRequest, GetSyncsQueryParams>,
      res: Response<GetSyncsResponse>
    ) => {
      function getObjectOrEntityFilter() {
        if (req.query?.object_type && req.query.object) {
          return {
            objectType: req.query.object_type,
            object: req.query.object,
          };
        }

        if (req.query?.entity_id) {
          return {
            entityId: req.query.entity_id,
          };
        }

        if (!req.query?.object_type && !req.query?.object && !req.query?.entity_id) {
          return {};
        }

        throw new BadRequestError('must filter on (object_type, object) or entity_id or neither');
      }

      const { next, previous, results, totalCount } = await syncService.list({
        applicationId: req.supaglueApplication.id,
        paginationParams: toPaginationInternalParams({ page_size: req.query?.page_size, cursor: req.query?.cursor }),
        ...getObjectOrEntityFilter(),
        externalCustomerId: req.query?.customer_id,
        providerName: req.query?.provider_name,
      });

      const snakeCaseResults = results.map((result) => {
        const base = {
          id: result.id,
          connection_id: result.connectionId,
          provider_name: result.providerName,
          customer_id: result.customerId,
          sync_config_id: result.syncConfigId,
          paused: result.paused,
        };
        if (result.type === 'object') {
          return {
            ...base,
            type: 'object' as const,
            object_type: result.objectType,
            object: result.object,
          };
        }

        return {
          ...base,
          type: 'entity' as const,
          entity_id: result.entityId,
        };
      });
      return res.status(200).send({ next, previous, results: snakeCaseResults, total_count: totalCount });
    }
  );

  syncRouterWithConnectionMiddleware.post(
    '/_trigger',
    async (
      req: Request<TriggerSyncPathParams, TriggerSyncResponse, TriggerSyncRequest, TriggerSyncQueryParams>,
      res: Response<TriggerSyncResponse>
    ) => {
      const sync = req.body.object_type
        ? await syncService.getByConnectionIdAndObjectTypeAndObject(
            req.customerConnection.id,
            req.body.object_type,
            req.body.object
          )
        : await syncService.getByConnectionIdAndEntity(req.customerConnection.id, req.body.entity_id);

      const updated = await connectionAndSyncService.triggerSync(sync, req.body.perform_full_refresh ?? false);
      const baseRet = {
        id: updated.id,
        connection_id: updated.connectionId,
        sync_config_id: updated.syncConfigId,
        paused: updated.paused,
      };

      if (updated.type === 'object') {
        return res.status(200).send({
          ...baseRet,
          type: 'object',
          object_type: updated.objectType,
          object: updated.object,
        });
      }

      return res.status(200).send({
        ...baseRet,
        type: 'entity',
        entity_id: updated.entityId,
      });
    }
  );

  syncRouterWithConnectionMiddleware.post(
    '/_pause',
    async (
      req: Request<PauseSyncPathParams, PauseSyncResponse, PauseSyncRequest, PauseSyncQueryParams>,
      res: Response<PauseSyncResponse>
    ) => {
      const sync = req.body.object_type
        ? await syncService.getByConnectionIdAndObjectTypeAndObject(
            req.customerConnection.id,
            req.body.object_type,
            req.body.object
          )
        : await syncService.getByConnectionIdAndEntity(req.customerConnection.id, req.body.entity_id);

      const updated = await connectionAndSyncService.pauseSync(sync, 'Manually paused by user');
      const baseRet = {
        id: updated.id,
        connection_id: updated.connectionId,
        sync_config_id: updated.syncConfigId,
        paused: updated.paused,
      };

      if (updated.type === 'object') {
        return res.status(200).send({
          ...baseRet,
          type: 'object',
          object_type: updated.objectType,
          object: updated.object,
        });
      }

      return res.status(200).send({
        ...baseRet,
        type: 'entity',
        entity_id: updated.entityId,
      });
    }
  );

  syncRouterWithConnectionMiddleware.post(
    '/_resume',
    async (
      req: Request<ResumeSyncPathParams, ResumeSyncResponse, ResumeSyncRequest, ResumeSyncQueryParams>,
      res: Response<ResumeSyncResponse>
    ) => {
      const sync = req.body.object_type
        ? await syncService.getByConnectionIdAndObjectTypeAndObject(
            req.customerConnection.id,
            req.body.object_type,
            req.body.object
          )
        : await syncService.getByConnectionIdAndEntity(req.customerConnection.id, req.body.entity_id);

      const updated = await connectionAndSyncService.resumeSync(sync);
      const baseRet = {
        id: updated.id,
        connection_id: updated.connectionId,
        sync_config_id: updated.syncConfigId,
        paused: updated.paused,
      };

      if (updated.type === 'object') {
        return res.status(200).send({
          ...baseRet,
          type: 'object',
          object_type: updated.objectType,
          object: updated.object,
        });
      }

      return res.status(200).send({
        ...baseRet,
        type: 'entity',
        entity_id: updated.entityId,
      });
    }
  );

  app.use('/syncs', syncRouter);
  app.use('/syncs', syncRouterWithConnectionMiddleware);
}
