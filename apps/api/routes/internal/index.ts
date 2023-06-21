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
import provider from './provider';
import syncConfig from './sync_config';
import syncHistory from './sync_history';
import syncInfo from './sync_info';
import webhook from './webhook';

const { prisma } = getDependencyContainer();

export default function init(app: Router): void {
  // application routes should not require application header
  const internalApplicationRouter = Router();
  internalApplicationRouter.use(internalMiddleware);

  internalApplicationRouter.use(orgHeaderMiddleware);

  internalApplicationRouter.get('/_migration_connections', async (req, res) => {
    const connections = await prisma.connection.findMany({
      where: {
        provider: {
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

  application(internalApplicationRouter);
  auth(internalApplicationRouter);

  app.use('/internal', internalApplicationRouter);

  // non-application routes require application header
  const internalRouter = Router();
  internalRouter.use(internalMiddleware);
  internalRouter.use(orgHeaderMiddleware);
  internalRouter.use(internalApplicationMiddleware);

  apiKey(internalRouter);
  customer(internalRouter);
  destination(internalRouter);
  provider(internalRouter);
  webhook(internalRouter);
  syncConfig(internalRouter);
  syncInfo(internalRouter);
  syncHistory(internalRouter);

  app.use('/internal', internalRouter);
}
