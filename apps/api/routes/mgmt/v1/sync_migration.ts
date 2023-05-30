import { getDependencyContainer } from '@/dependency_container';
import { fromDestinationModel } from '@supaglue/core/mappers/destination';
import { Router } from 'express';

const { prisma, connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router) {
  const router = Router();

  router.get('/_get_connections', async (req, res) => {
    const connections = await prisma.connection.findMany({
      where: {
        integration: {
          applicationId: req.supaglueApplication.id,
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

  router.post('/_migrate_connection', async (req, res) => {
    const { connection_id, version } = req.body; // v1 or v2

    if (version !== 'v1' && version !== 'v2') {
      return res.status(400).send({
        message: `Invalid version: ${version}`,
      });
    }

    let strategyType = 'full then incremental';
    if (version === 'v2') {
      const { destination } = await prisma.integration.findFirstOrThrow({
        where: {
          connections: {
            some: {
              id: connection_id,
            },
          },
        },
        select: {
          destination: true,
        },
      });
      if (destination && fromDestinationModel(destination).type === 's3') {
        strategyType = 'full only';
      }
    }

    const existingSync = await prisma.sync.findFirstOrThrow({
      where: {
        connection: {
          id: connection_id,
        },
      },
      select: {
        id: true,
        version: true,
      },
    });

    // Kill existing schedules before migrating syncs
    // Otherwise, when we set the strategy down below
    // the old syncs can override it
    if (existingSync.version === 'v1') {
      await connectionAndSyncService.deleteTemporalSyncsV1([existingSync.id]);
    } else if (existingSync.version === 'v2') {
      await connectionAndSyncService.deleteTemporalSyncsV2([existingSync.id]);
    }

    await prisma.$transaction([
      prisma.sync.update({
        where: {
          id: existingSync.id,
        },
        data: {
          // TODO: we need to kill the old syncs first before we set this,
          // since it could be overridden by the old running syncs
          strategy: {
            type: strategyType,
          },
          state: {
            phase: 'created',
          },
          version,
        },
      }),
      prisma.syncChange.create({
        data: {
          syncId: existingSync.id,
        },
      }),
    ]);

    return res.status(200).send({
      message: `Successfully migrated connection ${connection_id} to ${version}`,
    });
  });

  app.use('/sync-migration', router);
}
