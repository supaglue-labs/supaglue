import { connectionMiddleware } from '@/middleware/connection';
import { Router } from 'express';
import crm from './crm';
import oauth from './oauth';

export default function initRoutes(app: Router): void {
  oauth(app);

  app.use(connectionMiddleware);
  crm(app);
}
