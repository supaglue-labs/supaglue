import { getDependencyContainer } from '@/dependency_container';
import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { addLogContext } from '@supaglue/core/lib/logger';
import type {
  SendPassthroughRequestPathParams,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/schemas/v2/actions';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { passthroughService } = getDependencyContainer();

export default function init(app: Router): void {
  const v2Router = Router();
  v2Router.use(openapiMiddleware('actions', 'v2'));
  v2Router.use(pinoAndSentryContextMiddleware);

  v2Router.post(
    '/passthrough',
    async (
      req: Request<SendPassthroughRequestPathParams, SendPassthroughRequestResponse, SendPassthroughRequestRequest>,
      res: Response<SendPassthroughRequestResponse>
    ) => {
      addLogContext('passthrough', {
        method: req.body.method,
        path: req.body.path,
        headers: req.body.headers,
        query: req.body.query,
      });
      const response = await passthroughService.send(req.customerConnection.id, req.body);
      return res.status(200).send(response);
    }
  );

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
