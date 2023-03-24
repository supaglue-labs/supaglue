import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeysSansHeaders } from '@/lib/camelcase';
import { NotFoundError } from '@supaglue/core/errors';
import { snakecaseKeysSansHeaders } from '@supaglue/core/lib/snakecase';
import {
  CreateWebhookPathParams,
  CreateWebhookRequest,
  CreateWebhookResponse,
  DeleteWebhookPathParams,
  DeleteWebhookRequest,
  DeleteWebhookResponse,
  GetWebhookPathParams,
  GetWebhookRequest,
  GetWebhookResponse,
} from '@supaglue/schemas/mgmt';
import { Request, Response, Router } from 'express';

const { applicationService } = getDependencyContainer();

export default function init(app: Router): void {
  const webhookRouter = Router();

  webhookRouter.get(
    '/',
    async (
      req: Request<GetWebhookPathParams, GetWebhookResponse, GetWebhookRequest>,
      res: Response<GetWebhookResponse>
    ) => {
      const { webhook } = req.supaglueApplication.config;
      if (!webhook) {
        throw new NotFoundError('Webhook not found. You must create one first');
      }
      return res.status(200).send(snakecaseKeysSansHeaders(webhook));
    }
  );

  webhookRouter.post(
    '/',
    async (
      req: Request<CreateWebhookPathParams, CreateWebhookResponse, CreateWebhookRequest>,
      res: Response<CreateWebhookResponse>
    ) => {
      const application = await applicationService.update(req.supaglueApplication.id, {
        config: { ...req.supaglueApplication.config, webhook: camelcaseKeysSansHeaders(req.body) },
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return res.status(201).send(snakecaseKeysSansHeaders(application.config.webhook!));
    }
  );

  webhookRouter.delete(
    '/',
    async (
      req: Request<DeleteWebhookPathParams, DeleteWebhookResponse, DeleteWebhookRequest>,
      res: Response<DeleteWebhookResponse>
    ) => {
      await applicationService.update(req.supaglueApplication.id, {
        config: { ...req.supaglueApplication.config, webhook: null },
      });
      // TODO: Figure out why typing doesn't work here
      return res.status(200).send();
    }
  );

  app.use('/webhook', webhookRouter);
}
