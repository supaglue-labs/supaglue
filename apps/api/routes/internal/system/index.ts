import { getDependencyContainer } from '@/dependency_container';
import { PROCESS_SYNC_CHANGES_SCHEDULE_ID } from '@supaglue/sync-workflows/workflows/process_sync_changes';
import { ScheduleOverlapPolicy } from '@temporalio/client/lib/schedule-types';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { systemSettingsService, temporalClient, destinationService } = getDependencyContainer();

export default function init(app: Router): void {
  const systemRouter = Router();

  systemRouter.post('/_do_full_temporal_state_sync', async (req: Request, res: Response) => {
    await systemSettingsService.setProcessSyncChangesFull(/* full */ true);

    const handle = temporalClient.schedule.getHandle(PROCESS_SYNC_CHANGES_SCHEDULE_ID);
    await handle.trigger(ScheduleOverlapPolicy.BUFFER_ONE);

    return res.status(200).send();
  });

  systemRouter.post('/_encrypt_all_destination_creds', async (req: Request, res: Response) => {
    await destinationService.encryptAllDestinationConfigs();
    return res.status(200).send();
  });

  app.use('/system', systemRouter);
}
