import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@/lib/snakecase';
import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { NotFoundError } from '@supaglue/core/errors';
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

  webhookRouter.use(apiKeyHeaderMiddleware);

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
      return res.status(200).send(snakecaseKeys(webhook));
    }
  );

  webhookRouter.post(
    '/',
    async (
      req: Request<CreateWebhookPathParams, CreateWebhookResponse, CreateWebhookRequest>,
      res: Response<CreateWebhookResponse>
    ) => {
      const application = await applicationService.update(req.supaglueApplication.id, {
        config: { ...req.supaglueApplication.config, webhook: camelcaseKeys(req.body) },
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return res.status(201).send(snakecaseKeys(application.config.webhook!));
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
