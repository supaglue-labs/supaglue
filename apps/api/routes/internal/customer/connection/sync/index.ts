import { getDependencyContainer } from '@/dependency_container';
import {
  DisableSyncPathParams,
  EnableSyncPathParams,
  EnableSyncRequest,
  EnableSyncResponse,
  GetSyncPathParams,
  GetSyncRequest,
  GetSyncResponse,
  UpdateSyncPathParams,
  UpdateSyncRequest,
  UpdateSyncResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  const syncRouter = Router({ mergeParams: true });

  syncRouter.get(
    '/',
    async (req: Request<GetSyncPathParams, GetSyncResponse, GetSyncRequest>, res: Response<GetSyncResponse>) => {
      const sync = await connectionAndSyncService.getSyncIfExistByConnectionId(req.params.connection_id);
      return res.status(200).send({ sync: sync ? snakecaseKeys(sync) : undefined });
    }
  );

  // TODO: implement the version for `/:sync_id`

  syncRouter.post(
    '/',
    async (
      req: Request<EnableSyncPathParams, EnableSyncResponse, EnableSyncRequest>,
      res: Response<EnableSyncResponse>
    ) => {
      const sync = await connectionAndSyncService.enableSyncByConnectionId(
        req.params.connection_id,
        camelcaseKeys(req.body)
      );
      return res.status(200).send(snakecaseKeys(sync));
    }
  );

  syncRouter.patch(
    '/',
    async (
      req: Request<UpdateSyncPathParams, UpdateSyncResponse, UpdateSyncRequest>,
      res: Response<UpdateSyncResponse>
    ) => {
      const sync = await connectionAndSyncService.updateSyncByConnectionId(
        req.params.connection_id,
        camelcaseKeys(req.body)
      );
      return res.status(200).send(snakecaseKeys(sync));
    }
  );

  syncRouter.delete('/', async (req: Request<DisableSyncPathParams>, res: Response) => {
    await connectionAndSyncService.disableSyncByConnectionId(req.params.connection_id);
    return res.status(204).send();
  });

  app.use('/sync', syncRouter);
}
