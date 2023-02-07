import { Request, Response, Router } from 'express';
import { getDependencyContainer } from '../dependency_container';
import { errorMiddleware as posthogErrorMiddleware, middleware as posthogMiddleware } from '../lib/posthog';
import { Sync, SyncCreateParams, SyncRun, SyncRunStatus } from '../syncs/entities';

const { syncService, developerConfigService } = getDependencyContainer();

const router: Router = Router({ mergeParams: true });

router.get(
  '/',
  posthogMiddleware('Get Sync(s)'),
  async (
    req: Request<never, any, never, { customerId: string; syncConfigName?: string }>,
    res: Response<Sync | Sync[]>
  ) => {
    const { customerId, syncConfigName } = req.query;

    if (syncConfigName) {
      const sync = await syncService.getSyncByCustomerIdAndSyncConfigName(customerId, syncConfigName);

      return res.status(200).send(sync);
    } else if (req.query.customerId) {
      const syncs = await syncService.getSyncsAndSyncRunsByCustomerId(customerId);

      return res.status(200).send(syncs);
    }

    return res.status(501).send();
  },
  posthogErrorMiddleware('Get Sync(s)')
);

router.get(
  '/:syncId',
  posthogMiddleware('Get Sync'),
  async (req: Request<{ syncId: string }>, res: Response<Sync>) => {
    const sync = await syncService.getSyncById(req.params.syncId);

    return res.status(200).send(sync);
  },
  posthogErrorMiddleware('Get Sync')
);

router.post(
  '/',
  posthogMiddleware('Create Sync'),
  async (req: Request<never, any, SyncCreateParams>, res: Response<Sync>) => {
    const developerConfig = await developerConfigService.getDeveloperConfig();
    const sync = await syncService.createSync(req.body, developerConfig);

    return res.status(200).send(sync);
  },
  posthogErrorMiddleware('Create Sync')
);

router.put(
  '/:syncId',
  posthogMiddleware('Update Sync'),
  async (req: Request<{ syncId: string }, any, SyncCreateParams>, res: Response<Sync>) => {
    // TODO: Validate that `req.params.syncId` is equal to `req.body.id`.
    const developerConfig = await developerConfigService.getDeveloperConfig();
    const sync = await syncService.updateSync(req.params.syncId, req.body, developerConfig);

    return res.status(200).send(sync);
  },
  posthogErrorMiddleware('Update Sync')
);

router.post(
  '/:syncId/_trigger',
  posthogMiddleware('Manually Trigger Sync'),
  async (req: Request<{ syncId: string }>, res: Response) => {
    const { syncId } = req.params;
    await syncService.manuallyTriggerSync(syncId);

    return res.status(200).send();
  },
  posthogErrorMiddleware('Manually Trigger Sync')
);

router.get(
  '/run_logs',
  posthogMiddleware('Get Sync Run Logs'),
  async (
    req: Request<
      never,
      any,
      never,
      { syncConfigName?: string; customerId?: string; status?: SyncRunStatus; page?: string; count?: string }
    >,
    res: Response<{ logs: (SyncRun & { sync: Partial<Sync> })[] }>
  ) => {
    const { syncConfigName, customerId, status, page = '0', count = '10' } = req.query;

    const logs = await syncService.getSyncRunLogs({
      syncConfigName,
      customerId,
      status,
      page: parseInt(page),
      count: parseInt(count),
    });

    return res.status(200).send({ logs });
  },
  posthogErrorMiddleware('Get Sync Run Logs')
);

export default router;
