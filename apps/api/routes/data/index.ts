import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { pinoAndSentryContextMiddleware } from '@/middleware/pino_context';
import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const dataRouter = Router();

  dataRouter.use(apiKeyHeaderMiddleware);
  dataRouter.use(pinoAndSentryContextMiddleware);

  v2(dataRouter);

  app.use('/data', dataRouter);
}
