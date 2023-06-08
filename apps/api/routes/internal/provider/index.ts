import { getDependencyContainer } from '@/dependency_container';
import {
  CreateProviderPathParams,
  CreateProviderRequest,
  CreateProviderResponse,
  DeleteProviderPathParams,
  DeleteProviderRequest,
  DeleteProviderResponse,
  GetProviderPathParams,
  GetProviderRequest,
  GetProviderResponse,
  GetProvidersPathParams,
  GetProvidersRequest,
  GetProvidersResponse,
  UpdateProviderPathParams,
  UpdateProviderRequest,
  UpdateProviderResponse,
} from '@supaglue/schemas/v2/mgmt';
import { Provider, ProviderCreateParams } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { providerService, integrationService, connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const providerRouter = Router();

  providerRouter.get(
    '/',
    async (
      req: Request<GetProvidersPathParams, GetProvidersResponse, GetProvidersRequest>,
      res: Response<GetProvidersResponse>
    ) => {
      const providers = await providerService.list(req.supaglueApplication.id);
      return res.status(200).send(providers.map(snakecaseKeys));
    }
  );

  providerRouter.post(
    '/',
    async (
      req: Request<CreateProviderPathParams, CreateProviderResponse, CreateProviderRequest>,
      res: Response<CreateProviderResponse>
    ) => {
      const provider = await providerService.create({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(201).send(snakecaseKeys(provider));
    }
  );

  // Delete once migrated
  providerRouter.post('/_backfill', async (req: Request<never, Provider[]>, res: Response<Provider[]>) => {
    const integrations = await integrationService.list(req.supaglueApplication.id);
    const integrationIdToProviderIdMapping: Record<string, string> = {};
    const providers = await Promise.all(
      integrations.map(async (integration) => {
        const provider = await providerService.upsert({
          applicationId: req.supaglueApplication.id,
          name: integration.providerName,
          authType: integration.authType,
          category: integration.category,
          config: {
            providerAppId: integration.config.providerAppId,
            oauth: integration.config.oauth,
          },
        } as ProviderCreateParams);
        integrationIdToProviderIdMapping[integration.id] = provider.id;
        return provider;
      })
    );
    await connectionService.backfillConnectionsWithProviderId(integrationIdToProviderIdMapping);
    return res.status(201).send(providers);
  });

  providerRouter.get(
    '/:provider_id',
    async (
      req: Request<GetProviderPathParams, GetProviderResponse, GetProviderRequest>,
      res: Response<GetProviderResponse>
    ) => {
      const provider = await providerService.getByIdAndApplicationId(
        req.params.provider_id,
        req.supaglueApplication.id
      );
      return res.status(200).send(snakecaseKeys(provider));
    }
  );

  providerRouter.put(
    '/:provider_id',
    async (
      req: Request<UpdateProviderPathParams, UpdateProviderResponse, UpdateProviderRequest>,
      res: Response<UpdateProviderResponse>
    ) => {
      const provider = await providerService.update(req.params.provider_id, {
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(200).send(snakecaseKeys(provider));
    }
  );

  providerRouter.delete(
    '/:provider_id',
    async (
      req: Request<DeleteProviderPathParams, DeleteProviderResponse, DeleteProviderRequest>,
      res: Response<DeleteProviderResponse>
    ) => {
      await providerService.delete(req.params.provider_id, req.supaglueApplication.id);
      return res.status(204).send();
    }
  );

  app.use('/providers', providerRouter);
}
