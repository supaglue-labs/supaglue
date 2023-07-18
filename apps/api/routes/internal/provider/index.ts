import { getDependencyContainer } from '@/dependency_container';
import { hideManagedOauthConfig } from '@supaglue/core/mappers/provider';
import type {
  AddObjectPathParams,
  AddObjectRequest,
  AddObjectResponse,
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
import type { ProviderCreateParams, ProviderUpdateParams } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

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
      return res
        .status(200)
        .send(providers.map((provider) => snakecaseKeys(hideManagedOauthConfig(provider))) as GetProvidersResponse);
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
      } as ProviderCreateParams);
      return res.status(201).send(snakecaseKeys(hideManagedOauthConfig(provider)) as CreateProviderResponse);
    }
  );

  providerRouter.post(
    '/:provider_id/object',
    async (
      req: Request<AddObjectPathParams, AddObjectResponse, AddObjectRequest>,
      res: Response<AddObjectResponse>
    ) => {
      const provider = await providerService.addObject(req.params.provider_id, req.supaglueApplication.id, {
        ...camelcaseKeys(req.body),
      });
      return res.status(201).send(snakecaseKeys(hideManagedOauthConfig(provider)) as AddObjectResponse);
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
      return res.status(200).send(snakecaseKeys(hideManagedOauthConfig(provider)) as GetProviderResponse);
    }
  );

  providerRouter.put(
    '/:provider_id',
    async (
      req: Request<UpdateProviderPathParams, UpdateProviderResponse, UpdateProviderRequest>,
      res: Response<UpdateProviderResponse>
    ) => {
      const provider = await providerService.update(req.params.provider_id, req.supaglueApplication.id, {
        ...camelcaseKeys(req.body),
      } as ProviderUpdateParams);
      return res.status(200).send(snakecaseKeys(hideManagedOauthConfig(provider)) as UpdateProviderResponse);
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
