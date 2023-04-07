import { getDependencyContainer } from '@/dependency_container';
import {
  ManuallyCleanUpOrphanedTemporalSyncsPathParams,
  ManuallyCleanUpOrphanedTemporalSyncsRequest,
  ManuallyCleanUpOrphanedTemporalSyncsResponse,
} from '@supaglue/schemas/mgmt';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.post(
    '/_manually_clean_up_orphaned_temporal_syncs',
    async (
      req: Request<
        ManuallyCleanUpOrphanedTemporalSyncsPathParams,
        ManuallyCleanUpOrphanedTemporalSyncsResponse,
        ManuallyCleanUpOrphanedTemporalSyncsRequest
      >,
      res: Response<ManuallyCleanUpOrphanedTemporalSyncsResponse>
    ) => {
      const result = await connectionAndSyncService.manuallyCleanUpOrphanedTemporalSyncs();
      return res.status(200).send(snakecaseKeys(result));
    }
  );

  app.use('/sync', router);
}
