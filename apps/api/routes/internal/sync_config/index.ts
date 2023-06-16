import { getDependencyContainer } from '@/dependency_container';
import { getDefaultCommonObjects } from '@supaglue/core/services';
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
import { CommonModelType, SyncConfig } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { integrationService, syncConfigService, providerService, destinationService } = getDependencyContainer();

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
              object: commonObject.object as CommonModelType,
            })),
          },
        }),
      });
      return res.status(201).send(snakecaseKeys(syncConfig));
    }
  );

  syncConfigRouter.post(
    '/_backfill',
    async (req: Request<never, SyncConfig[], { fetch_all_fields_into_raw: boolean }>, res: Response<SyncConfig[]>) => {
      const integrations = await integrationService.list(req.supaglueApplication.id);
      const providers = await providerService.list(req.supaglueApplication.id);
      const integrationsWithDestinations = integrations.filter((integration) => integration.destinationId);
      const integrationIdToSyncConfigIdMapping: Record<string, string> = {};
      const syncConfigs = await Promise.all(
        integrationsWithDestinations.map(async (integration) => {
          const destination = await destinationService.getDestinationByIntegrationId(integration.id);
          const syncConfig = await syncConfigService.upsert({
            applicationId: req.supaglueApplication.id,
            destinationId: integration.destinationId!,
            providerId: providers.find((provider) => provider.name === integration.providerName)!.id,
            config: {
              defaultConfig: {
                periodMs: integration.config.sync.periodMs,
                strategy: destination?.type === 's3' ? 'full only' : 'full then incremental',
              },
              commonObjects: getDefaultCommonObjects(integration.category, req.body.fetch_all_fields_into_raw),
              rawObjects: [],
            },
          });
          integrationIdToSyncConfigIdMapping[integration.id] = syncConfig.id;
          return syncConfig;
        })
      );
      await syncConfigService.backfillSyncConfigIds(integrationIdToSyncConfigIdMapping);
      return res.status(201).send(syncConfigs);
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
      const syncConfig = await syncConfigService.update(req.params.sync_config_id, {
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys({
          ...req.body,
          config: {
            ...req.body.config,
            common_objects: req.body.config.common_objects?.map((commonObject) => ({
              ...commonObject,
              object: commonObject.object as CommonModelType,
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
