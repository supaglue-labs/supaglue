import { getDependencyContainer } from '@/dependency_container';
import { internalMiddleware } from '@/middleware/internal';
import { internalApplicationMiddleware } from '@/middleware/internal_application';
import { orgHeaderMiddleware } from '@/middleware/org';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers';
import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import { Router } from 'express';
import apiKey from './api_key';
import application from './application';
import auth from './auth';
import customer from './customer';
import integration from './integration';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

const { prisma } = getDependencyContainer();

export default function init(app: Router): void {
  // application routes should not require application header
  const v1ApplicationRouter = Router();
  v1ApplicationRouter.use(internalMiddleware);

  // TODO: Remove when we're done calling this so we can bring back
  // https://github.com/supaglue-labs/supaglue/pull/634
  v1ApplicationRouter.post('/_backfill_last_modified_at', async (req, res) => {
    for (const table of Object.values(COMMON_MODEL_DB_TABLES)) {
      await prisma.$executeRawUnsafe(`
UPDATE ${table}
SET last_modified_at = GREATEST(
  COALESCE(remote_updated_at, TIMESTAMP 'epoch'),
  COALESCE(detected_or_remote_deleted_at, TIMESTAMP 'epoch')
)
WHERE last_modified_at IS NULL;
`);
    }
  });

  v1ApplicationRouter.post('/_backfill_connection_remote_id', async (req, res) => {
    const salesforceConnectionModels = await prisma.connection.findMany({
      where: {
        providerName: 'salesforce',
      },
    });
    const unsafeSalesforceConnections = await Promise.all(
      salesforceConnectionModels.map(fromConnectionModelToConnectionUnsafe<'salesforce'>)
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
  integration(v1Router);
  webhook(v1Router);
  syncInfo(v1Router);
  syncHistory(v1Router);

  app.use('/v1', v1Router);
}
