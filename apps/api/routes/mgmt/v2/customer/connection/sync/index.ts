import { getDependencyContainer } from '@/dependency_container';
import {
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
      throw new Error('Not implemented');
    }
  );

  // TODO: implement the version for `/:sync_id`

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

  app.use('/sync', syncRouter);
}
