import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const crmRouter = Router();

  crmRouter.use(apiKeyHeaderMiddleware);
  crmRouter.use(connectionHeaderMiddleware);

  v2(crmRouter);

  app.use('/crm', crmRouter);
}
