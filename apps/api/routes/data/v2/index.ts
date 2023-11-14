import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { pinoContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import hubspot from './hubspot';
import salesforce from './salesforce';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(openapiMiddleware('data', 'v2'));
  v2Router.use(pinoContextMiddleware);

  salesforce(v2Router);
  hubspot(v2Router);

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
