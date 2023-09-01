import { getDependencyContainer } from '@/dependency_container';
import type {
  CreateMagicLinkPathParams,
  CreateMagicLinkRequest,
  CreateMagicLinkResponse,
  DeleteMagicLinkPathParams,
  DeleteMagicLinkRequest,
  DeleteMagicLinkResponse,
  GetMagicLinksPathParams,
  GetMagicLinksRequest,
  GetMagicLinksResponse,
} from '@supaglue/schemas/v2/mgmt';
import type { MagicLink } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { magicLinkService } = getDependencyContainer();

export default function init(app: Router): void {
  const magicLinkRouter = Router({ mergeParams: true });

  magicLinkRouter.get(
    '/',
    async (
      req: Request<GetMagicLinksPathParams, GetMagicLinksResponse, GetMagicLinksRequest>,
      res: Response<GetMagicLinksResponse>
    ) => {
      const magicLinks = await magicLinkService.listByApplicationId(req.supaglueApplication.id);
      return res.status(200).send(magicLinks.map(toSnakecasedKeysMagicLink));
    }
  );

  magicLinkRouter.post(
    '/',
    async (
      req: Request<CreateMagicLinkPathParams, CreateMagicLinkResponse, CreateMagicLinkRequest>,
      res: Response<CreateMagicLinkResponse>
    ) => {
      const magicLink = await magicLinkService.createMagicLink(req.supaglueApplication.id, camelcaseKeys(req.body));
      return res.status(201).send(toSnakecasedKeysMagicLink(magicLink));
    }
  );

  magicLinkRouter.delete(
    '/:magic_link_id',
    async (
      req: Request<DeleteMagicLinkPathParams, DeleteMagicLinkResponse, DeleteMagicLinkRequest>,
      res: Response<DeleteMagicLinkResponse>
    ) => {
      await magicLinkService.deleteMagicLink(req.supaglueApplication.id, req.params.magic_link_id);
      return res.status(204).end();
    }
  );

  app.use('/magic_links', magicLinkRouter);
}

function toSnakecasedKeysMagicLink({
  id,
  url,
  returnUrl,
  expiresAt,
  applicationId,
  providerId,
  providerName,
  customerId,
  status,
}: MagicLink) {
  return {
    id,
    url,
    return_url: returnUrl,
    application_id: applicationId,
    provider_id: providerId,
    provider_name: providerName,
    customer_id: customerId,
    expires_at: expiresAt,
    status,
  };
}
