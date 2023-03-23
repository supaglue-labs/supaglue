import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
import {
  CreateIntegrationPathParams,
  CreateIntegrationRequest,
  CreateIntegrationResponse,
  DeleteIntegrationPathParams,
  DeleteIntegrationRequest,
  DeleteIntegrationResponse,
  GetIntegrationPathParams,
  GetIntegrationRequest,
  GetIntegrationResponse,
  GetIntegrationsPathParams,
  GetIntegrationsRequest,
  GetIntegrationsResponse,
  UpdateIntegrationPathParams,
  UpdateIntegrationRequest,
  UpdateIntegrationResponse,
} from '@supaglue/schemas/mgmt';
import { Request, Response, Router } from 'express';

const { integrationService } = getDependencyContainer();

export default function init(app: Router): void {
  const integrationRouter = Router();

  integrationRouter.get(
    '/',
    async (
      req: Request<GetIntegrationsPathParams, GetIntegrationsResponse, GetIntegrationsRequest>,
      res: Response<GetIntegrationsResponse>
    ) => {
      const integrations = await integrationService.list(req.supaglueApplication.id);
      return res.status(200).send(integrations.map(snakecaseKeys));
    }
  );

  integrationRouter.post(
    '/',
    async (
      req: Request<CreateIntegrationPathParams, CreateIntegrationResponse, CreateIntegrationRequest>,
      res: Response<CreateIntegrationResponse>
    ) => {
      const integration = await integrationService.create({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(201).send(snakecaseKeys(integration));
    }
  );

  integrationRouter.get(
    '/:integration_id',
    async (
      req: Request<GetIntegrationPathParams, GetIntegrationResponse, GetIntegrationRequest>,
      res: Response<GetIntegrationResponse>
    ) => {
      const integration = await integrationService.getByIdAndApplicationId(
        req.params.integration_id,
        req.supaglueApplication.id
      );
      return res.status(200).send(snakecaseKeys(integration));
    }
  );

  integrationRouter.put(
    '/:integration_id',
    async (
      req: Request<UpdateIntegrationPathParams, UpdateIntegrationResponse, UpdateIntegrationRequest>,
      res: Response<UpdateIntegrationResponse>
    ) => {
      const integration = await integrationService.update(req.params.integration_id, {
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(integration));
    }
  );

  integrationRouter.delete(
    '/:integration_id',
    async (
      req: Request<DeleteIntegrationPathParams, DeleteIntegrationResponse, DeleteIntegrationRequest>,
      res: Response<DeleteIntegrationResponse>
    ) => {
      await integrationService.delete(req.params.integration_id, req.supaglueApplication.id);
      return res.status(204).send();
    }
  );

  app.use('/integrations', integrationRouter);
}
