import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const managementRouter = Router();

  managementRouter.use(apiKeyHeaderMiddleware);

  v2(managementRouter);

  app.use('/data', managementRouter);
}
