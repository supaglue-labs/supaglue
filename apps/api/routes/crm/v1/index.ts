import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import accounts from './account';
import contacts from './contact';
import leads from './lead';
import opportunities from './opportunity';
import passthrough from './passthrough';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import users from './user';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(openapiMiddleware('crm'));

  contacts(v1Router);
  accounts(v1Router);
  leads(v1Router);
  opportunities(v1Router);
  users(v1Router);

  passthrough(v1Router);

  syncInfo(v1Router);
  syncHistory(v1Router);

  v1Router.use(openApiErrorHandlerMiddleware);

  app.use('/v1', v1Router);
}
