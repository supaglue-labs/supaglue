import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import associationType from './association_type';
import object from './object';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(apiKeyHeaderMiddleware);
  v2Router.use(openapiMiddleware('metadata', 'v2'));

  associationType(v2Router);
  object(v2Router);

  app.use('/v2', v2Router);
}
