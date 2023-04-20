import { getDependencyContainer } from '@/dependency_container';
import { internalMiddleware } from '@/middleware/internal';
import { internalApplicationMiddleware } from '@/middleware/internal_application';
import { orgHeaderMiddleware } from '@/middleware/org';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Router } from 'express';
import apiKey from './api_key';
import application from './application';
import auth from './auth';
import customer from './customer';
import destination from './destination';
import integration from './integration';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

const { connectionAndSyncService, prisma } = getDependencyContainer();

export default function init(app: Router): void {
  // application routes should not require application header
  const v1ApplicationRouter = Router();
  v1ApplicationRouter.use(internalMiddleware);

  v1ApplicationRouter.post('/_manually_fix_syncs', async (req, res) => {
    const result = await connectionAndSyncService.manuallyFixTemporalSyncs();
    return res.status(200).send(snakecaseKeys(result));
  });

  v1ApplicationRouter.post('/_backfill_connection_remote_id', async (req, res) => {
    const salesforceConnectionModels = await prisma.connection.findMany({
      where: {
        providerName: 'salesforce',
      },
    });
    const unsafeSalesforceConnections = await Promise.all(
      salesforceConnectionModels.map(fromConnectionModelToConnectionUnsafe)
    );
    let updated = 0;
    unsafeSalesforceConnections.map(async ({ id, remoteId, providerName, credentials }) => {
      if (providerName === 'salesforce' && remoteId !== credentials.instanceUrl) {
        await prisma.connection.update({
          where: { id },
          data: {
            remoteId: credentials.instanceUrl,
          },
        });
        updated += 1;
      }
    });
    res.status(200).send(`Updated ${updated} connections`);
  });

  v1ApplicationRouter.use(orgHeaderMiddleware);

  application(v1ApplicationRouter);
  auth(v1ApplicationRouter);

  app.use('/v1', v1ApplicationRouter);

  // non-application routes require application header
  const v1Router = Router();
  v1Router.use(internalMiddleware);
  v1Router.use(orgHeaderMiddleware);
  v1Router.use(internalApplicationMiddleware);

  apiKey(v1Router);
  customer(v1Router);
  destination(v1Router);
  integration(v1Router);
  webhook(v1Router);
  syncInfo(v1Router);
  syncHistory(v1Router);

  app.use('/v1', v1Router);
}
