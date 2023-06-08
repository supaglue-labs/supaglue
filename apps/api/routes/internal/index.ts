import { getDependencyContainer } from '@/dependency_container';
import { internalMiddleware } from '@/middleware/internal';
import { internalApplicationMiddleware } from '@/middleware/internal_application';
import { orgHeaderMiddleware } from '@/middleware/org';
import { Router } from 'express';
import apiKey from './api_key';
import application from './application';
import auth from './auth';
import customer from './customer';
import destination from './destination';
import integration from './integration';
import provider from './provider';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

const { prisma, connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  // application routes should not require application header
  const v1ApplicationRouter = Router();
  v1ApplicationRouter.use(internalMiddleware);

  v1ApplicationRouter.use(orgHeaderMiddleware);

  v1ApplicationRouter.get('/_migration_connections', async (req, res) => {
    const connections = await prisma.connection.findMany({
      where: {
        integration: {
          application: {
            orgId: req.orgId,
          },
        },
      },
      select: {
        id: true,
        providerName: true,
        customerId: true,
        sync: {
          select: {
            version: true,
          },
        },
      },
    });

    return res.status(200).send(
      connections.map((connection) => ({
        id: connection.id,
        provider_name: connection.providerName,
        customer_id: connection.customerId,
        sync_version: connection.sync?.version,
      }))
    );
  });

  // TODO: Need to reset sync state too
  v1ApplicationRouter.post('/_migrate_connections', async (req, res) => {
    const { version, strategy } = req.body; // v1 or v2
    if (version !== 'v1' && version !== 'v2') {
      throw new Error(`Invalid version: ${version}`);
    }

    const syncs = await prisma.sync.findMany({
      where: {
        connection: {
          integration: {
            application: {
              orgId: req.orgId,
            },
          },
        },
      },
      select: {
        id: true,
        version: true,
      },
    });

    for (const sync of syncs) {
      // Kill existing schedules before migrating syncs
      // Otherwise, when we set the strategy down below
      // the old syncs can override it
      if (sync.version === 'v1') {
        await connectionAndSyncService.deleteTemporalSyncsV1([sync.id]);
      } else if (sync.version === 'v2') {
        await connectionAndSyncService.deleteTemporalSyncsV2([sync.id]);
      }
    }

    await prisma.$transaction([
      prisma.sync.updateMany({
        data: {
          // TODO: we need to kill the old syncs first before we set this,
          // since it could be overridden by the old running syncs
          strategy: {
            type: strategy,
          },
          state: {
            phase: 'created',
          },
          version,
        },
        where: {
          id: {
            in: syncs.map((sync) => sync.id),
          },
        },
      }),
      prisma.syncChange.createMany({
        data: syncs.map((sync) => ({
          syncId: sync.id,
        })),
      }),
    ]);

    return res.status(200).send();
  });

  application(v1ApplicationRouter);
  auth(v1ApplicationRouter);

  app.use('/internal', v1ApplicationRouter);

  // non-application routes require application header
  const v1Router = Router();
  v1Router.use(internalMiddleware);
  v1Router.use(orgHeaderMiddleware);
  v1Router.use(internalApplicationMiddleware);

  apiKey(v1Router);
  customer(v1Router);
  destination(v1Router);
  integration(v1Router);
  provider(v1Router);
  webhook(v1Router);
  syncInfo(v1Router);
  syncHistory(v1Router);

  app.use('/internal', v1Router);
}
