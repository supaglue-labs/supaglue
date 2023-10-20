import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import accounts from './account';
import associations from './associations';
import contacts from './contact';
import customObjects from './custom_objects';
import leads from './lead';
import lists from './list';
import metadata from './metadata';
import opportunities from './opportunity';
import passthrough from './passthrough';
import standardObjects from './standard_objects';
import users from './user';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(openapiMiddleware('crm', 'v2'));
  v2Router.use(pinoAndSentryContextMiddleware);

  contacts(v2Router);
  accounts(v2Router);
  leads(v2Router);
  opportunities(v2Router);
  users(v2Router);
  lists(v2Router);
  metadata(v2Router);
  customObjects(v2Router);
  standardObjects(v2Router);
  associations(v2Router);

  passthrough(v2Router);

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
