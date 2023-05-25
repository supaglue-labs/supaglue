import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { Router } from 'express';
import v1 from './v1';
import v2 from './v2';

export default function init(app: Router): void {
  const managementRouter = Router();

  managementRouter.use(apiKeyHeaderMiddleware);
  managementRouter.use(connectionHeaderMiddleware);

  v1(managementRouter);
  v2(managementRouter);

  app.use('/engagement', managementRouter);
}
