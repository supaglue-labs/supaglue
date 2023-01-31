import { PrismaClient } from '@prisma/client';
import { Client, ScheduleAlreadyRunning, ScheduleNotFoundError, ScheduleOverlapPolicy } from '@temporalio/client';
import { DeveloperConfig, SyncConfig } from '../../developer_config/entities';
import { TEMPORAL_SYNC_TASKS_TASK_QUEUE } from '../../temporal';
import { getRunSyncWorkflowId, runSync } from '../../temporal/workflows';
import { fromModelToSyncRun, Sync, SyncCreateParams, SyncRun, SyncUpdateParams } from '../entities';
import { getSyncId } from '../util';

export class SyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;

  constructor(prisma: PrismaClient, temporalClient: Client) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
  }

  public async getSyncById(syncId: string): Promise<Sync> {
    return (await this.#prisma.sync.findUniqueOrThrow({
      where: {
        id: syncId,
      },
    })) as Sync;
  }

  public async getSyncByCustomerIdAndSyncConfigName(
    customerId: string,
    syncConfigName: string
  ): Promise<Sync | undefined> {
    const model = await this.#prisma.sync.findUnique({
      where: {
        id: getSyncId({ syncConfigName, customerId }),
      },
    });
    if (!model) {
      return;
    }
    return model as Sync;
  }

  public async getSyncsAndSyncRunsByCustomerId(
    customerId: string,
    syncRunCount = 50
  ): Promise<(Sync & { SyncRun: SyncRun[] })[]> {
    const syncs = await this.#prisma.sync.findMany({
      where: {
        customerId,
      },
      include: {
        SyncRun: {
          // TODO: it seems that this doesn't do what you would think
          //       and return the first N sync runs per sync, but rather
          //       it returns the first N for all syncs that are returned
          //       by the where clause above. So we need to overfetch.
          take: syncRunCount,
          orderBy: {
            startTimestamp: 'desc',
          },
        },
      },
    });

    return syncs as unknown as (Sync & { SyncRun: SyncRun[] })[];
  }

  public async createSync(params: SyncCreateParams, developerConfig: DeveloperConfig): Promise<Sync> {
    const model = await this.#prisma.sync.create({
      data: {
        ...params,
        id: getSyncId(params),
      },
    });
    const sync = model as Sync;

    const syncConfig = developerConfig.getSyncConfig(sync.syncConfigName);

    // TODO: We need to guarantee that this call is successfully made. A few options:
    // 1. Transactionally write an event into another table and
    // create a background Temporal workflow to create this schedule, or
    // 2. Get rid of Sync entity in DB and treat Temporal sync workflow schedule as SOT, or
    // 3. Spin up a Temporal workflow to both create the Sync DB record AND create the Temporal schedule.
    await this.updateTemporalSyncSchedule(sync, syncConfig);

    return sync;
  }

  public async updateSync(
    syncId: Sync['id'],
    params: SyncUpdateParams,
    developerConfig: DeveloperConfig
  ): Promise<Sync> {
    const model = await this.#prisma.sync.update({
      data: params,
      where: {
        id: syncId,
      },
    });
    const sync = model as Sync;

    // TODO: We shouldn't be doing the look up this way
    const syncConfig = developerConfig.getSyncConfig(sync.syncConfigName);

    // TODO: We need to guarantee that this call is successfully made. A few options:
    // 1. Transactionally write an event into another table and
    // create a background Temporal workflow to create this schedule, or
    // 2. Get rid of Sync entity in DB and treat Temporal sync workflow schedule as SOT, or
    // 3. Spin up a Temporal workflow to both create the Sync DB record AND create the Temporal schedule.
    await this.updateTemporalSyncSchedule(sync, syncConfig);

    return sync;
  }

  private async updateTemporalSyncSchedule(sync: Sync, syncConfig: SyncConfig): Promise<void> {
    const syncScheduleId = getSyncScheduleId(sync.id);

    try {
      await this.#temporalClient.schedule.create({
        scheduleId: syncScheduleId,
        spec: {
          cronExpressions: [syncConfig.cronExpression], // TODO: Validate?
        },
        action: {
          type: 'startWorkflow',
          workflowType: runSync,
          workflowId: getRunSyncWorkflowId(sync.id),
          taskQueue: TEMPORAL_SYNC_TASKS_TASK_QUEUE,
          args: [{ syncId: sync.id }], // TODO: type-checking is not working here
        },
        state: {
          paused: !sync.enabled,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ScheduleAlreadyRunning) {
        await this.#temporalClient.schedule.getHandle(syncScheduleId).update((prevSchedule) => {
          return {
            ...prevSchedule,
            spec: {
              cronExpressions: [syncConfig.cronExpression], // TODO: Validate?
            },
            action: {
              type: 'startWorkflow',
              workflowType: runSync,
              workflowId: getRunSyncWorkflowId(sync.id),
              taskQueue: TEMPORAL_SYNC_TASKS_TASK_QUEUE,
              args: [{ syncId: sync.id }], // TODO: type-checking is not working here
            },
            state: {
              paused: !sync.enabled,
            },
          };
        });
        return;
      }

      throw err;
    }
  }

  public async manuallyTriggerSync(syncId: string): Promise<void> {
    const syncScheduleId = getSyncScheduleId(syncId);
    // If there's already a sync ongoing, ignore it.
    // TODO: We need to make the create/update schedule robust so that this manual workflow can always
    // find this schedule already created in Temporal.
    await this.#temporalClient.schedule.getHandle(syncScheduleId).trigger(ScheduleOverlapPolicy.SKIP);
  }

  public async pauseSync(syncId: string, note?: string): Promise<void> {
    // TODO: We should have this call `updateSync`, but we don't want to look up developerconfig because of cyclic dependency
    await this.#prisma.sync.update({
      data: {
        // TODO: Consider putting the note on the Sync as well and not just the SyncRun.
        enabled: false,
      },
      where: {
        id: syncId,
      },
    });

    // TODO: This shouldn't be best-effort
    const syncScheduleId = getSyncScheduleId(syncId);
    try {
      await this.#temporalClient.schedule.getHandle(syncScheduleId).pause(note);
    } catch (err: unknown) {
      if (err instanceof ScheduleNotFoundError) {
        // swallow
        return;
      }

      throw err;
    }
  }

  public async createSyncRun(syncId: string): Promise<SyncRun> {
    const model = await this.#prisma.syncRun.create({
      data: { syncId, startTimestamp: new Date(), status: 'running' },
    });
    return fromModelToSyncRun(model);
  }

  public async finishSyncRun(syncRunId: string, errorMessage?: string): Promise<SyncRun> {
    const model = await this.#prisma.syncRun.update({
      where: { id: syncRunId },
      data: { finishTimestamp: new Date(), status: errorMessage ? 'error' : 'success' },
    });
    return fromModelToSyncRun(model);
  }
}

function getSyncScheduleId(syncId: string): string {
  return `run-sync-schedule-${syncId}`;
}
