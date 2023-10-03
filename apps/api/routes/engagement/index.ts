import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const engagementRouter = Router();

  engagementRouter.use(apiKeyHeaderMiddleware);
  engagementRouter.use(connectionHeaderMiddleware);
  engagementRouter.use(pinoAndSentryContextMiddleware);

  v2(engagementRouter);

  app.use('/engagement', engagementRouter);
}
