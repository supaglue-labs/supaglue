import { getDependencyContainer } from '@/dependency_container';
import { hideManagedOauthConfig } from '@supaglue/core/mappers/provider';
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
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { providerService } = getDependencyContainer();

export default function init(app: Router): void {
  const providerRouter = Router();

  providerRouter.get(
    '/',
    async (
      req: Request<GetProvidersPathParams, GetProvidersResponse, GetProvidersRequest>,
      res: Response<GetProvidersResponse>
    ) => {
      const providers = await providerService.list(req.supaglueApplication.id);
      return res.status(200).send(providers.map((provider) => snakecaseKeys(hideManagedOauthConfig(provider))));
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
      return res.status(201).send(snakecaseKeys(hideManagedOauthConfig(provider)));
    }
  );

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
      return res.status(200).send(snakecaseKeys(hideManagedOauthConfig(provider)));
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
      return res.status(200).send(snakecaseKeys(hideManagedOauthConfig(provider)));
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
