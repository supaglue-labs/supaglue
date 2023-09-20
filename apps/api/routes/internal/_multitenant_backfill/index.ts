import { getDependencyContainer } from '@/dependency_container';
import cuid from 'cuid';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { prisma } = getDependencyContainer();

export default function init(app: Router): void {
  const systemRouter = Router();

  systemRouter.post('/_object_sync_runs_cuid', async (req: Request, res: Response) => {
    let cursor: { id: string } | null = { id: '' };
    let counter = 0;
    while (cursor !== null) {
      await prisma.$transaction(async (tx) => {
        const records = await tx.syncRun.findMany({
          cursor: cursor && cursor.id ? cursor : undefined,
          skip: cursor ? 1 : undefined,
          take: 5000,
          orderBy: {
            id: 'asc',
          },
        });

        const updatePromises = [];
        for (const record of records) {
          counter += 1;
          console.log('xxx', counter);

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
      });
    }

    return res.status(200).send();
  });

  app.use('/_multitenant_backfill', systemRouter);
}
