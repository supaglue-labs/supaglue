import { openApiErrorHandlerMiddleware, openapiMiddleware } from '@/middleware/openapi';
import { Router } from 'express';
import account from './account';
import contact from './contact';
import mailbox from './mailbox';
import passthrough from './passthrough';
import sequence from './sequence';
import sequenceState from './sequence_state';
import user from './user';

export default function init(app: Router): void {
  const v2Router = Router();

  v2Router.use(openapiMiddleware('engagement', 'v2'));

  account(v2Router);
  contact(v2Router);
  user(v2Router);
  sequence(v2Router);
  sequenceState(v2Router);
  mailbox(v2Router);
  passthrough(v2Router);

  v2Router.use(openApiErrorHandlerMiddleware);

  app.use('/v2', v2Router);
}
