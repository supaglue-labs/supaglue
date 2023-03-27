import { getDependencyContainer } from '@/dependency_container';
import { apiKeyHeaderMiddleware } from '@/middleware/api_key';
import { openapiMiddleware } from '@/middleware/openapi';
import { Request, Response, Router } from 'express';
import customer from './customer';
import integration from './integration';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

const { connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const v1Router = Router();

  v1Router.use(apiKeyHeaderMiddleware);
  v1Router.post('/_backfill_remote_account_ids', async (req: Request, res: Response) => {
    await connectionService.backfillRemoteAccountIds(req.supaglueApplication.id);
    return res.status(200).send();
  });
  v1Router.use(openapiMiddleware('mgmt'));

  customer(v1Router);
  integration(v1Router);
  webhook(v1Router);
  syncInfo(v1Router);
  syncHistory(v1Router);

  app.use('/v1', v1Router);
}
