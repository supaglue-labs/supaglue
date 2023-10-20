import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import object from './object';
import property from './property';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(apiKeyHeaderMiddleware);
  v2Router.use(openapiMiddleware('metadata', 'v2'));
  v2Router.use(pinoAndSentryContextMiddleware);

  object(v2Router);
  property(v2Router);

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
