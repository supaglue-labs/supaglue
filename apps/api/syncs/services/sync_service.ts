import { Prisma, PrismaClient } from '@prisma/client';
import { RealtimeInboundSyncConfig, Sync, SyncConfig, SyncCreateParams, SyncUpdateParams } from '@supaglue/types';
import { Client, ScheduleAlreadyRunning, ScheduleNotFoundError, ScheduleOverlapPolicy } from '@temporalio/client';
import { DeveloperConfig } from '../../developer_config/entities';
import { logger } from '../../logger';
import { TEMPORAL_SYNC_TASKS_TASK_QUEUE } from '../../temporal';
import { getRunSyncWorkflowId, runSync } from '../../temporal/workflows';
import { fromModelToSyncRun, fromModelToSyncRunWithSyncData, SyncRun, SyncRunStatus } from '../entities';
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
    })) as unknown as Sync;
  }

  public async getSyncByCustomerIdAndSyncConfigName({
    customerId,
    syncConfigName,
  }: {
    customerId: string;
    syncConfigName: string;
  }): Promise<Sync | undefined> {
    const model = await this.#prisma.sync.findUnique({
      where: {
        id: getSyncId({ syncConfigName, customerId }),
      },
    });
    if (!model) {
      return;
    }
    // TODO: Implement a real mapper
    return model as unknown as Sync;
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

  private getCreateSyncParams(syncConfig: SyncConfig, customerId: string): SyncCreateParams {
    if (syncConfig.type === 'outbound') {
      if (syncConfig.destination.objectConfig.type === 'selectable') {
        return {
          type: 'outbound',
          syncConfigName: syncConfig.name,
          customerId,
          enabled: false,
          destination: {
            object: syncConfig.destination.objectConfig.objectChoices[0],
          },
        };
      }
    }
  }

  public async createSync2(
    developerConfig: DeveloperConfig,
    syncConfigName: string,
    customerId: string
  ): Promise<Sync> {
    const syncConfig = developerConfig.getSyncConfig(syncConfigName);
  }

  public async createSync(params: SyncCreateParams, developerConfig: DeveloperConfig): Promise<Sync> {
    const model = await this.#prisma.sync.create({
      data: {
        ...params,
        id: getSyncId(params),
      },
    });
    const sync = model as unknown as Sync;

    const syncConfig = developerConfig.getSyncConfig(sync.syncConfigName);

    // TODO: We need to guarantee that this call is successfully made. A few options:
    // 1. Transactionally write an event into another table and
    // create a background Temporal workflow to create this schedule, or
    // 2. Get rid of Sync entity in DB and treat Temporal sync workflow schedule as SOT, or
    // 3. Spin up a Temporal workflow to both create the Sync DB record AND create the Temporal schedule.
    if (syncConfig.type === 'inbound' || syncConfig.type === 'outbound') {
      await this.updateTemporalSyncSchedule(sync, syncConfig);
    } else if (syncConfig.type === 'realtime_inbound') {
      // TODO: set up the realtime inbound sync
    }

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
    if (syncConfig.type === 'inbound' || syncConfig.type === 'outbound') {
      await this.updateTemporalSyncSchedule(sync, syncConfig);
    } else if (syncConfig.type === 'realtime_inbound') {
      // TODO: set up the realtime inbound sync
    }

    return sync;
  }

  private async updateTemporalSyncSchedule(
    sync: Sync,
    syncConfig: Exclude<SyncConfig, RealtimeInboundSyncConfig>
  ): Promise<void> {
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
        logger.warn(`Tried to pause sync ${syncId} but schedule ${syncScheduleId} was not found`);
        return;
      }

      throw err;
    }
  }

  public async resumeSync({ syncId, note }: { syncId: string; note?: string }): Promise<void> {
    await this.#prisma.sync.update({
      data: {
        enabled: true,
      },
      where: {
        id: syncId,
      },
    });

    // TODO: This shouldn't be best-effort
    const syncScheduleId = getSyncScheduleId(syncId);
    try {
      await this.#temporalClient.schedule.getHandle(syncScheduleId).unpause(note);
    } catch (err: unknown) {
      if (err instanceof ScheduleNotFoundError) {
        logger.warn(`Tried to resume sync ${syncId} but schedule ${syncScheduleId} was not found`);
        // swallow
        return;
      }

      throw err;
    }
  }

  public async deleteSyncsForCustomer(transaction: Prisma.TransactionClient, customerId: string): Promise<void> {
    const syncs = await transaction.sync.findMany({
      where: { customerId },
      select: { id: true, enabled: true },
    });

    // Pause all enabled syncs right away, as a precaution
    await Promise.all(syncs.filter((sync) => sync.enabled).map((enabledSync) => this.pauseSync(enabledSync.id)));

    // Then delete them
    await Promise.all(
      syncs.map((sync) => {
        // TODO: This shouldn't be best-effort
        const syncScheduleId = getSyncScheduleId(sync.id);
        this.#temporalClient.schedule.getHandle(syncScheduleId).delete();
      })
    );

    await transaction.sync.deleteMany({ where: { id: { in: syncs.map((sync) => sync.id) } } });
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
      data: { finishTimestamp: new Date(), status: errorMessage ? 'error' : 'success', errorMessage },
    });
    return fromModelToSyncRun(model);
  }

  public async getSyncRunLogs({
    syncConfigName,
    customerId,
    status,
    page,
    count,
  }: {
    syncConfigName?: string;
    customerId?: string;
    status?: SyncRunStatus;
    page: number;
    count: number;
  }): Promise<(SyncRun & { sync: Partial<Sync> })[]> {
    const models = await this.#prisma.syncRun.findMany({
      where: { status, sync: customerId || syncConfigName ? { is: { customerId, syncConfigName } } : undefined },
      orderBy: { startTimestamp: 'desc' },
      skip: page * count,
      take: count,
      include: { sync: { select: { syncConfigName: true, customerId: true } } },
    });
    return models.map(fromModelToSyncRunWithSyncData);
  }
}

function getSyncScheduleId(syncId: string): string {
  return `run-sync-schedule-${syncId}`;
}
