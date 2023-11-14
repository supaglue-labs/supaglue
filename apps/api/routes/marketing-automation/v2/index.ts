import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { pinoContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import forms from './forms';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(openapiMiddleware('marketing-automation', 'v2'));
  v2Router.use(pinoContextMiddleware);

  forms(v2Router);

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
