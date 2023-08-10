import { getDependencyContainer } from '@/dependency_container';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { connectionService, connectionAndSyncService, remoteService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router({ mergeParams: true });

  connectionRouter.get('/:connection_id', async (req: Request, res: Response) => {
    const connection = await connectionService.getUnsafeByIdAndApplicationId(
      req.params.connection_id,
      req.supaglueApplication.id
    );

    return res.status(200).send(snakecaseKeys({ ...connection }));
  });

  app.use('/connections', connectionRouter);
}
