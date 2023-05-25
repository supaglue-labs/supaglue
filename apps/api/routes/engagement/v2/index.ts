import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import contact from './contact';
import mailbox from './mailbox';
import passthrough from './passthrough';
import sequence from './sequence';
import sequenceState from './sequence_state';
import user from './user';

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(openapiMiddleware('engagement', 'v2'));

  contact(v1Router);
  user(v1Router);
  sequence(v1Router);
  sequenceState(v1Router);
  mailbox(v1Router);
  passthrough(v1Router);

  v1Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v1Router);
}
