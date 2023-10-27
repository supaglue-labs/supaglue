import { getDependencyContainer } from '@/dependency_container';
import { hideManagedOauthConfig } from '@supaglue/core/mappers/provider';
import type {
  GetProviderPathParams,
  GetProviderRequest,
  GetProviderResponse,
  GetProvidersPathParams,
  GetProvidersRequest,
  GetProvidersResponse,
} from '@supaglue/schemas/v2/mgmt';
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

  app.use('/providers', providerRouter);
}
