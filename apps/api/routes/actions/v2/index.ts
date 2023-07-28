import { getDependencyContainer } from '@/dependency_container';
import { openapiMiddleware } from '@/middleware/openapi';
import type {
  SendPassthroughRequestPathParams,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/schemas/v2/actions';
import type { Request, Response } from 'express';
import { Router } from 'express';
import entities from './entities';

const { passthroughService } = getDependencyContainer();

export default function init(app: Router): void {
  const v2Router = Router();
  v2Router.use(openapiMiddleware('actions', 'v2'));

  v2Router.post(
    '/passthrough',
    async (
      req: Request<SendPassthroughRequestPathParams, SendPassthroughRequestResponse, SendPassthroughRequestRequest>,
      res: Response<SendPassthroughRequestResponse>
    ) => {
      const response = await passthroughService.send(req.customerConnection.id, req.body);
      return res.status(200).send(response);
    }
  );

  entities(v2Router);

  app.use('/v2', v2Router);
}
