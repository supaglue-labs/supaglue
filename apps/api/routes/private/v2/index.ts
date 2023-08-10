import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { privateApiWhitelistMiddleware } from '@/middleware/private_whitelist';
import { Router } from 'express';
import customer from './customer';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(apiKeyHeaderMiddleware);
  v2Router.use(privateApiWhitelistMiddleware);

  customer(v2Router);

  app.use('/v2', v2Router);
}
