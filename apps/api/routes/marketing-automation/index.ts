import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const marketingAutomationRouter = Router();

  marketingAutomationRouter.use(apiKeyHeaderMiddleware);
  marketingAutomationRouter.use(connectionHeaderMiddleware);
  marketingAutomationRouter.use(pinoAndSentryContextMiddleware);

  v2(marketingAutomationRouter);

  app.use('/marketing-automation', marketingAutomationRouter);
}
