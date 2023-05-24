import { Router } from 'express';
import accounts from './account';
import contacts from './contact';
import events from './event';
import leads from './lead';
import opportunities from './opportunity';
import passthrough from './passthrough';
import users from './user';

export default function init(app: Router): void {
  const v1Router = Router();

  // v1Router.use(openapiMiddleware('crm'));

  contacts(v1Router);
  accounts(v1Router);
  leads(v1Router);
  opportunities(v1Router);
  users(v1Router);
  events(v1Router);

  passthrough(v1Router);

  // v1Router.use(openApiErrorHandlerMiddleware);

  app.use('/v1', v1Router);
}
