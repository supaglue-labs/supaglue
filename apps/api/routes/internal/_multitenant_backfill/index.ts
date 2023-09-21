import { getDependencyContainer } from '@/dependency_container';
import { logger } from '@supaglue/core/lib';
import cuid from 'cuid';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { prisma } = getDependencyContainer();

export default function init(app: Router): void {
  const systemRouter = Router();

  systemRouter.post('/_object_sync_runs_cuid', async (req: Request, res: Response) => {
    let cursor: { id: string } | null = { id: '' };

    const date = new Date();
    date.setDate(date.getDate() - 7);

    while (cursor !== null) {
      await prisma.$transaction(
        async (tx) => {
          const records = await tx.syncRun.findMany({
            cursor: cursor && cursor.id ? cursor : undefined,
            skip: cursor ? 1 : undefined,
            take: 5000,
            where: {
              startTimestamp: {
                gte: date,
              },
            },
            orderBy: {
              id: 'asc',
            },
          });

          logger.info({ count: records.length }, 'Backfilling sync runs cuid');

          const updatePromises = [];
          for (const record of records) {
            const updateResult = await tx.syncRun.update({
              where: {
                id: record.id,
              },
              data: {
                ...record,
                cuid: cuid(),
              },
            });

            updatePromises.push(updateResult);
          }

          const lastRecord = records[records.length - 1];
          cursor = lastRecord ? { id: lastRecord.id } : null;

          return updatePromises;
        },
        {
          timeout: 10000,
        }
      );
    }

    return res.status(200).send();
  });

  app.use('/_multitenant_backfill', systemRouter);
}
