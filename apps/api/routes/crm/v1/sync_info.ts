import { getDependencyContainer } from '@/dependency_container';
import { GetSyncInfosPathParams, GetSyncInfosRequest, GetSyncInfosResponse } from '@supaglue/schemas/crm';
import { Request, Response, Router } from 'express';

const { syncService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<GetSyncInfosPathParams, GetSyncInfosResponse, GetSyncInfosRequest>,
      res: Response<GetSyncInfosResponse>
    ) => {
      const syncInfoList = await syncService.getSyncInfoList(req.customerConnection.id);
      return res.status(200).send(syncInfoList);
    }
  );

  app.use('/sync-info', router);
}
