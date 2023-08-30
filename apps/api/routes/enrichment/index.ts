import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const enrichmentRouter = Router();

  enrichmentRouter.use(apiKeyHeaderMiddleware);
  enrichmentRouter.use(connectionHeaderMiddleware);

  v2(enrichmentRouter);

  app.use('/engagement', enrichmentRouter);
}
