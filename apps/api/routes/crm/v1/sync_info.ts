import { getDependencyContainer } from '@/dependency_container';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
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
      const syncInfoListRes = syncInfoList.map((syncInfo) =>
        snakecaseKeys({
          ...syncInfo,
          lastSyncStart: syncInfo.lastSyncStart?.toISOString(),
          nextSyncStart: syncInfo.nextSyncStart?.toISOString(),
        })
      );
      return res.status(200).send(syncInfoListRes);
    }
  );

  app.use('/sync-info', router);
}
