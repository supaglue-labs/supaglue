import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const actionsRouter = Router();

  actionsRouter.use(apiKeyHeaderMiddleware);
  actionsRouter.use(connectionHeaderMiddleware);
  actionsRouter.use(pinoAndSentryContextMiddleware);

  v2(actionsRouter);

  app.use('/actions', actionsRouter);
}
