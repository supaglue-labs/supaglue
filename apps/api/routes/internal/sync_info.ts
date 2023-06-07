import { getDependencyContainer } from '@/dependency_container';
import {
  GetSyncInfosPathParams,
  GetSyncInfosQueryParams,
  GetSyncInfosRequest,
  GetSyncInfosResponse,
} from '@supaglue/schemas/v1/mgmt';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get(
    '/',
    async (
      req: Request<GetSyncInfosPathParams, GetSyncInfosResponse, GetSyncInfosRequest, GetSyncInfosQueryParams>,
      res: Response<GetSyncInfosResponse>
    ) => {
      const syncInfoList = await connectionAndSyncService.getSyncInfoList({
        applicationId: req.supaglueApplication.id,
        externalCustomerId: req.query?.customer_id,
        providerName: req.query?.provider_name,
      });
      const syncInfoListRes = syncInfoList.map((syncInfo) =>
        snakecaseKeys({
          ...syncInfo,
          lastSyncStart: syncInfo.lastSyncStart?.toISOString() ?? null,
          nextSyncStart: syncInfo.nextSyncStart?.toISOString() ?? null,
        })
      );
      return res.status(200).send(syncInfoListRes);
    }
  );

  app.use('/sync-info', router);
}
