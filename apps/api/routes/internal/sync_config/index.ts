import { getDependencyContainer } from '@/dependency_container';
import {
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
import { CommonModelType } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

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
      return res.status(200).send(
        syncConfigs.map((syncConfig) => {
          const { defaultConfig, rawObjects, rawCustomObjects, commonObjects } = syncConfig.config;
          return snakecaseKeys({
            ...syncConfig,
            config: {
              defaultConfig,
              commonObjects,
              standardObjects: rawObjects, // TODO: remove when we propogate `standardObjects` all the way through code
              customObjects: rawCustomObjects,
            },
          });
        })
      );
    }
  );

  syncConfigRouter.post(
    '/',
    async (
      req: Request<CreateSyncConfigPathParams, CreateSyncConfigResponse, CreateSyncConfigRequest>,
      res: Response<CreateSyncConfigResponse>
    ) => {
      const { default_config, common_objects, standard_objects, custom_objects } = req.body.config;
      const syncConfig = await syncConfigService.create({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys({
          ...req.body,
          config: {
            default_config,
            common_objects: common_objects?.map((commonObject) => ({
              ...commonObject,
              object: commonObject.object as CommonModelType,
            })),
            raw_objects: standard_objects,
            raw_custom_objects: custom_objects,
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
      const { defaultConfig, commonObjects, rawObjects, rawCustomObjects } = syncConfig.config;
      return res.status(200).send(
        snakecaseKeys({
          ...syncConfig,
          config: {
            defaultConfig,
            commonObjects,
            standardObjects: rawObjects, // TODO: remove when we propogate `standardObjects` all the way through code
            customObjects: rawCustomObjects,
          },
        })
      );
    }
  );

  syncConfigRouter.put(
    '/:sync_config_id',
    async (
      req: Request<UpdateSyncConfigPathParams, UpdateSyncConfigResponse, UpdateSyncConfigRequest>,
      res: Response<UpdateSyncConfigResponse>
    ) => {
      const { default_config, common_objects, standard_objects, custom_objects } = req.body.config;
      const syncConfig = await syncConfigService.update(req.params.sync_config_id, {
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys({
          ...req.body,
          config: {
            default_config,
            common_objects: common_objects?.map((commonObject) => ({
              ...commonObject,
              object: commonObject.object as CommonModelType,
            })),
            raw_objects: standard_objects,
            raw_custom_objects: custom_objects,
          },
        }),
      });
      const { defaultConfig, commonObjects, rawObjects, rawCustomObjects } = syncConfig.config;
      return res.status(200).send(
        snakecaseKeys({
          ...syncConfig,
          config: {
            defaultConfig,
            commonObjects,
            standardObjects: rawObjects, // TODO: remove when we propogate `standardObjects` all the way through code
            customObjects: rawCustomObjects,
          },
        })
      );
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
