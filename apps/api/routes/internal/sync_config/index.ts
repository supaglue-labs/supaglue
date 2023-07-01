import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateSyncConfigPathParams,
  CreateSyncConfigRequest,
  CreateSyncConfigResponse,
  DeleteSyncConfigPathParams,
  DeleteSyncConfigRequest,
  DeleteSyncConfigResponse,
  GetSyncConfigPathParams,
  GetSyncConfigRequest,
  GetSyncConfigResponse,
  GetSyncConfigsPathParams,
  GetSyncConfigsRequest,
  GetSyncConfigsResponse,
  UpdateSyncConfigPathParams,
  UpdateSyncConfigRequest,
  UpdateSyncConfigResponse,
} from '@supaglue/schemas/v2/mgmt';
import type { CommonObjectType } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { syncConfigService } = getDependencyContainer();

export default function init(app: Router): void {
  const syncConfigRouter = Router();

  syncConfigRouter.get(
    '/',
    async (
      req: Request<GetSyncConfigsPathParams, GetSyncConfigsResponse, GetSyncConfigsRequest>,
      res: Response<GetSyncConfigsResponse>
    ) => {
      const syncConfigs = await syncConfigService.list(req.supaglueApplication.id);
      return res.status(200).send(syncConfigs.map(snakecaseKeys));
    }
  );

  syncConfigRouter.post(
    '/',
    async (
      req: Request<CreateSyncConfigPathParams, CreateSyncConfigResponse, CreateSyncConfigRequest>,
      res: Response<CreateSyncConfigResponse>
    ) => {
      const syncConfig = await syncConfigService.create({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys({
          ...req.body,
          config: {
            ...req.body.config,
            common_objects: req.body.config.common_objects?.map((commonObject) => ({
              ...commonObject,
              object: commonObject.object as CommonObjectType,
            })),
          },
        }),
      });
      return res.status(201).send(snakecaseKeys(syncConfig));
    }
  );

  syncConfigRouter.get(
    '/:sync_config_id',
    async (
      req: Request<GetSyncConfigPathParams, GetSyncConfigResponse, GetSyncConfigRequest>,
      res: Response<GetSyncConfigResponse>
    ) => {
      const syncConfig = await syncConfigService.getByIdAndApplicationId(
        req.params.sync_config_id,
        req.supaglueApplication.id
      );
      return res.status(200).send(snakecaseKeys(syncConfig));
    }
  );

  syncConfigRouter.put(
    '/:sync_config_id',
    async (
      req: Request<UpdateSyncConfigPathParams, UpdateSyncConfigResponse, UpdateSyncConfigRequest>,
      res: Response<UpdateSyncConfigResponse>
    ) => {
      const syncConfig = await syncConfigService.update(req.params.sync_config_id, req.supaglueApplication.id, {
        ...camelcaseKeys({
          ...req.body,
          config: {
            ...req.body.config,
            common_objects: req.body.config.common_objects?.map((commonObject) => ({
              ...commonObject,
              object: commonObject.object as CommonObjectType,
            })),
          },
        }),
      });
      return res.status(200).send(snakecaseKeys(syncConfig));
    }
  );

  syncConfigRouter.delete(
    '/:sync_config_id',
    async (
      req: Request<DeleteSyncConfigPathParams, DeleteSyncConfigResponse, DeleteSyncConfigRequest>,
      res: Response<DeleteSyncConfigResponse>
    ) => {
      await syncConfigService.delete(req.params.sync_config_id, req.supaglueApplication.id);
      return res.status(204).send();
    }
  );

  app.use('/sync_configs', syncConfigRouter);
}
