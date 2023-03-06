import { connectionHeaderMiddleware } from '@/middleware/connection';
import { Router } from 'express';
import crm from './crm';
import customer from './customer';
import oauth from './oauth';

export default function initRoutes(app: Router): void {
  oauth(app);

  customer(app);

  app.use(connectionHeaderMiddleware);
  crm(app);
}
