import { getDependencyContainer } from '@/dependency_container';
import { logger } from '@supaglue/core/lib';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { prisma } = getDependencyContainer();

export default function init(app: Router): void {
  const applicationRouter = Router();

  applicationRouter.post('/_denormalize_object_sync_runs', async (req: Request, res: Response) => {
    const objectSyncIds = await prisma.$queryRaw<
      { object_sync_id: string }[]
    >`SELECT DISTINCT object_sync_id FROM object_sync_runs`;
    for (const objectSyncId of objectSyncIds) {
      const objectSync = await prisma.$queryRaw<
        { connection_id: string; object: string; object_type: string; entity_id: string; type: string }[]
      >`SELECT connection_id, object, object_type, entity_id, type FROM object_syncs WHERE id = ${objectSyncId.object_sync_id}`;

      if (!objectSync || objectSync.length !== 1) {
        throw new Error('object sync not found');
      }

      const updateObjectSyncRunResult: number =
        await prisma.$queryRaw`UPDATE object_sync_runs SET connection_id = ${objectSync[0].connection_id}, object = ${objectSync[0].object}, object_type = ${objectSync[0].object_type}, entity_id = ${objectSync[0].entity_id}, sync_type = ${objectSync[0].type} WHERE object_sync_id = ${objectSyncId.object_sync_id}`;

      if (updateObjectSyncRunResult === 0) {
        throw new Error('update object sync run failed');
      }

      logger.info(
        {
          object_sync_id: objectSyncId.object_sync_id,
        },
        'backfilled object_sync_runs for a object sync id'
      );
    }

    return res.status(200).send();
  });

  app.use('/_backfill', applicationRouter);
}
