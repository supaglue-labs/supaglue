import { connectionHeaderMiddleware } from '@/middleware/connection';
import { Router } from 'express';
import v1 from './v1';

export default function init(app: Router): void {
  const crmRouter = Router();
  crmRouter.use(connectionHeaderMiddleware);

  v1(crmRouter);

  app.use('/crm', crmRouter);
}
