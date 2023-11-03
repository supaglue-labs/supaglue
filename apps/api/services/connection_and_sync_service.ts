import { Client as HubspotClient } from '@hubspot/api-client';
import { BadRequestError, NotFoundError } from '@supaglue/core/errors';
import { logger, maybeSendWebhookPayload } from '@supaglue/core/lib';
import { encrypt } from '@supaglue/core/lib/crypt';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers/connection';
import { fromSyncModel } from '@supaglue/core/mappers/sync';
import type { ApplicationService, ProviderService, SyncConfigService, WebhookService } from '@supaglue/core/services';
import type { ConnectionService } from '@supaglue/core/services/connection_service';
import type { Prisma, PrismaClient } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import {
  processSyncChanges,
  PROCESS_SYNC_CHANGES_SCHEDULE_ID,
  PROCESS_SYNC_CHANGES_WORKFLOW_ID,
} from '@supaglue/sync-workflows/workflows/process_sync_changes';
import { getRunObjectSyncScheduleId } from '@supaglue/sync-workflows/workflows/run_object_sync';
import type { ProviderCategory, ProviderName } from '@supaglue/types';
import type {
  ConnectionCreateParams,
  ConnectionCreateParamsAny,
  ConnectionSafeAny,
  ConnectionUnsafeAny,
  ConnectionUpsertParamsAny,
  ImportedConnectionCredentials,
} from '@supaglue/types/connection';
import type { ObjectSync, Sync } from '@supaglue/types/sync';
import { snakecaseKeys } from '@supaglue/utils';
import type { Client } from '@temporalio/client';
import { ScheduleAlreadyRunning, ScheduleOverlapPolicy } from '@temporalio/client';
import { v4 as uuidv4 } from 'uuid';

export class ConnectionAndSyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #providerService: ProviderService;
  #syncConfigService: SyncConfigService;
  #applicationService: ApplicationService;
  #connectionService: ConnectionService;
  #webhookService: WebhookService;

  constructor(
    prisma: PrismaClient,
    temporalClient: Client,
    providerService: ProviderService,
    syncConfigService: SyncConfigService,
    applicationService: ApplicationService,
    connectionService: ConnectionService,
    webhookService: WebhookService
  ) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#providerService = providerService;
    this.#syncConfigService = syncConfigService;
    this.#applicationService = applicationService;
    this.#connectionService = connectionService;
    this.#webhookService = webhookService;
  }

  public async triggerSync(sync: Sync, performFullRefresh: boolean): Promise<Sync> {
    // Record whether next run should do full refresh or not
    const newSync = await this.#prisma.sync.update({
      where: {
        id: sync.id,
      },
      data: {
        argsForNextRun: {
          performFullRefresh,
        },
      },
    });

    // Trigger a run in Temporal
    const handle = this.#temporalClient.schedule.getHandle(getRunObjectSyncScheduleId(sync.id));
    // TODO: is this the right policy? should it be configurable?
    await handle.trigger(ScheduleOverlapPolicy.SKIP);

    return fromSyncModel(newSync);
  }

  async #changeSyncPausedState(sync: Sync, pausedState: boolean): Promise<Sync> {
    if (sync.paused === pausedState) {
      return sync;
    }

    const newSync = await this.#prisma.$transaction(async (tx) => {
      const [newSync] = await Promise.all([
        tx.sync.update({
          where: {
            id: sync.id,
          },
          data: {
            paused: pausedState,
          },
        }),
        tx.syncChange.create({
          data: {
            syncId: sync.id,
          },
        }),
      ]);

      return newSync;
    });

    return fromSyncModel(newSync);
  }

  /**
   * NOTE: duped with sync_service in sync-worker package. @todo: consolidate it
   */
  public async pauseSync(sync: Sync, pauseReason?: string): Promise<Sync> {
    const pausedSync = (await this.#changeSyncPausedState(sync, true)) as ObjectSync; // NOTE: only support object syncs
    const connection = await this.#connectionService.getSafeById(sync.connectionId);

    await this.#webhookService.sendMessage(
      'sync.paused',
      {
        connection_id: pausedSync.connectionId,
        customer_id: connection.customerId,
        provider_name: connection.providerName,
        type: 'object',
        object_type: pausedSync.objectType,
        object: pausedSync.object,
        pause_reason: pauseReason,
      },
      connection.applicationId
    );

    return pausedSync;
  }

  public async resumeSync(sync: Sync): Promise<Sync> {
    return await this.#changeSyncPausedState(sync, false);
  }

  public async upsert(params: ConnectionUpsertParamsAny): Promise<ConnectionUnsafeAny> {
    const provider = await this.#prisma.provider.findUnique({
      where: {
        applicationId_name: {
          applicationId: params.applicationId,
          name: params.providerName,
        },
      },
    });
    if (!provider) {
      throw new Error(`No provider found for ${params.providerName}`);
    }
    const status = 'added';
    const customerId = getCustomerIdPk(params.applicationId, params.customerId);
    const connection = await this.#prisma.connection.upsert({
      create: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        providerId: provider.id,
        status,
        credentials: await encrypt(JSON.stringify(params.credentials)),
        instanceUrl: params.instanceUrl,
      },
      update: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        providerId: provider.id,
        status,
        credentials: await encrypt(JSON.stringify(params.credentials)),
        instanceUrl: params.instanceUrl,
      },
      where: {
        customerId_providerId: {
          customerId,
          providerId: provider.id,
        },
      },
    });

    return fromConnectionModelToConnectionUnsafe<ProviderName>(connection);
  }

  public async createManually(
    applicationId: string,
    customerId: string,
    importedCredentials: ImportedConnectionCredentials
  ): Promise<ConnectionSafeAny> {
    // TODO: Delegate this logic to each remote to implement instead
    // of doing it in ConnectionAndSyncService.
    const provider = await this.#providerService.getByNameAndApplicationId(
      importedCredentials.providerName,
      applicationId
    );

    switch (importedCredentials.providerName) {
      case 'apollo': {
        const params: ConnectionCreateParams<'apollo'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'engagement',
          customerId,
          credentials: {
            type: importedCredentials.type,
            apiKey: importedCredentials.apiKey,
          },
          instanceUrl: '',
        };
        return await this.create(params);
      }
      case 'clearbit': {
        const params: ConnectionCreateParams<'clearbit'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'enrichment',
          customerId,
          credentials: {
            type: importedCredentials.type,
            apiKey: importedCredentials.apiKey,
          },
          instanceUrl: '',
        };
        return await this.create(params);
      }
      case '6sense': {
        const params: ConnectionCreateParams<'6sense'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'enrichment',
          customerId,
          credentials: {
            type: importedCredentials.type,
            apiKey: importedCredentials.apiKey,
          },
          instanceUrl: '',
        };
        return await this.create(params);
      }
      case 'gong': {
        const params: ConnectionCreateParams<'gong'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'no_category',
          customerId,
          credentials: {
            type: importedCredentials.type,
            accessKey: importedCredentials.accessKey,
            accessKeySecret: importedCredentials.accessKeySecret,
          },
          instanceUrl: '',
        };
        return await this.create(params);
      }
      case 'salesforce': {
        // TODO: actually fetch an access token and store it
        const params: ConnectionCreateParams<'salesforce'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'crm',
          customerId,
          credentials: {
            type: importedCredentials.type,
            refreshToken: importedCredentials.refreshToken,
            // TODO: we should not require access token if you have refresh token
            accessToken: '',
            expiresAt: null,
            instanceUrl: importedCredentials.instanceUrl,
            loginUrl: importedCredentials.loginUrl,
          },
          instanceUrl: importedCredentials.instanceUrl,
        };
        return await this.create(params);
      }
      case 'hubspot': {
        if (provider.name !== 'hubspot') {
          throw new BadRequestError(`Provider name ${provider.name} does not match credentials provider name`);
        }

        // Fetch access token, expiry, hub id and other info
        const client = new HubspotClient();
        const token = await client.oauth.tokensApi.create(
          'refresh_token',
          undefined,
          undefined,
          provider.config.oauth.credentials.oauthClientId,
          provider.config.oauth.credentials.oauthClientSecret,
          importedCredentials.refreshToken
        );
        const newAccessToken = token.accessToken;
        const newRefreshToken = token.refreshToken;
        const expiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString();

        const { hubId } = await client.oauth.accessTokensApi.get(newAccessToken);
        const instanceUrl = `https://app.hubspot.com/contacts/${hubId.toString()}`;

        const params: ConnectionCreateParams<'hubspot'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'crm',
          customerId,
          credentials: {
            type: importedCredentials.type,
            refreshToken: newRefreshToken,
            accessToken: newAccessToken,
            expiresAt,
          },
          instanceUrl,
        };
        return await this.create(params);
      }
      case 'marketo': {
        const params: ConnectionCreateParams<'marketo'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'marketing_automation',
          customerId,
          credentials: {
            type: importedCredentials.type,
            instanceUrl: importedCredentials.instanceUrl,
            clientId: importedCredentials.clientId,
            clientSecret: importedCredentials.clientSecret,
          },
          instanceUrl: importedCredentials.instanceUrl,
        };
        return await this.create(params);
      }
      case 'salesforce_marketing_cloud_account_engagement': {
        // TODO: actually fetch an access token and store it
        const params: ConnectionCreateParams<'salesforce_marketing_cloud_account_engagement'> = {
          applicationId,
          providerName: importedCredentials.providerName,
          providerId: provider.id,
          category: 'marketing_automation',
          customerId,
          credentials: {
            type: importedCredentials.type,
            refreshToken: importedCredentials.refreshToken,
            // TODO: we should not require access token if you have refresh token
            accessToken: '',
            expiresAt: null,
            businessUnitId: importedCredentials.businessUnitId,
            loginUrl: importedCredentials.loginUrl,
          },
          instanceUrl: '',
        };
        return await this.create(params);
      }

      default:
        throw new BadRequestError(`Provider name ${(importedCredentials as any).providerName} is not supported`);
    }
  }

  public async create(params: ConnectionCreateParamsAny): Promise<ConnectionUnsafeAny> {
    const provider = await this.#providerService.getByNameAndApplicationId(params.providerName, params.applicationId);
    const syncConfig = await this.#syncConfigService.findByProviderId(provider.id);
    const application = await this.#applicationService.getById(provider.applicationId);
    let errored = false;

    const connectionId = uuidv4();
    try {
      const status = 'added';

      const connectionModel = await this.#prisma.$transaction(async (tx) => {
        const connectionModel = await tx.connection.create({
          data: {
            id: connectionId,
            category: params.category,
            providerName: params.providerName,
            customerId: getCustomerIdPk(params.applicationId, params.customerId),
            providerId: provider.id,
            status,
            instanceUrl: params.instanceUrl,
            credentials: await encrypt(JSON.stringify(params.credentials)),
          },
        });

        if (syncConfig) {
          // New syncs
          const syncIds: string[] = [];

          const autoStart = syncConfig.config.defaultConfig.autoStartOnConnection ?? true;

          if (syncConfig.config.commonObjects?.length) {
            const commonObjectSyncArgs: Prisma.SyncCreateManyInput[] = [];
            for (const commonObject of syncConfig.config.commonObjects) {
              const commonObjectSyncId = uuidv4();
              syncIds.push(commonObjectSyncId);
              commonObjectSyncArgs.push({
                id: commonObjectSyncId,
                type: 'object',
                objectType: 'common',
                object: commonObject.object,
                connectionId,
                paused: !autoStart,
                syncConfigId: syncConfig.id,
                strategy: {
                  type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
                },
                state: {
                  phase: 'created',
                },
              });
            }
            await tx.sync.createMany({
              data: commonObjectSyncArgs,
            });
          }

          if (syncConfig.config.standardObjects?.length) {
            const standardObjectSyncArgs: Prisma.SyncCreateManyInput[] = [];
            for (const standardObject of syncConfig.config.standardObjects) {
              const standardObjectSyncId = uuidv4();
              syncIds.push(standardObjectSyncId);
              standardObjectSyncArgs.push({
                id: standardObjectSyncId,
                type: 'object',
                objectType: 'standard',
                object: standardObject.object,
                connectionId,
                paused: !autoStart,
                syncConfigId: syncConfig.id,
                strategy: {
                  type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
                },
                state: {
                  phase: 'created',
                },
              });
            }
            await tx.sync.createMany({
              data: standardObjectSyncArgs,
            });
          }

          if (syncConfig.config.customObjects?.length) {
            const customObjectSyncArgs: Prisma.SyncCreateManyInput[] = [];
            for (const customObject of syncConfig.config.customObjects) {
              const customObjectSyncId = uuidv4();
              syncIds.push(customObjectSyncId);
              customObjectSyncArgs.push({
                id: customObjectSyncId,
                type: 'object',
                objectType: 'custom',
                object: customObject.object,
                connectionId,
                paused: !autoStart,
                syncConfigId: syncConfig.id,
                strategy: {
                  type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
                },
                state: {
                  phase: 'created',
                },
              });
            }
            await tx.sync.createMany({
              data: customObjectSyncArgs,
            });
          }

          if (syncConfig.config.entities?.length) {
            const entitySyncArgs: Prisma.SyncCreateManyInput[] = [];
            for (const entity of syncConfig.config.entities) {
              const entitySyncId = uuidv4();
              syncIds.push(entitySyncId);
              entitySyncArgs.push({
                id: entitySyncId,
                type: 'entity',
                entityId: entity.entityId,
                connectionId,
                paused: !autoStart,
                syncConfigId: syncConfig.id,
                strategy: {
                  type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
                },
                state: {
                  phase: 'created',
                },
              });
            }
            await tx.sync.createMany({
              data: entitySyncArgs,
            });
          }

          if (syncIds.length) {
            await tx.syncChange.createMany({
              data: syncIds.map((syncId) => ({
                syncId,
              })),
            });
          }
        }
        return connectionModel;
      });

      const connection = await fromConnectionModelToConnectionUnsafe<ProviderName>(connectionModel);

      // best-effort trigger schedule to process sync changes. even if this fails, the
      // schedule will trigger the workflow on the next run
      this.#triggerProcessSyncChangesTemporalSchedule().catch((err) =>
        logger.error(err, 'Error triggering processSyncChanges Temporal schedule')
      );

      return connection;
    } catch (e) {
      errored = true;
      throw e;
    } finally {
      const { credentials: _, ...paramsWithoutCredentials } = params;
      await this.#webhookService.sendMessage(
        'connection.created',
        { ...snakecaseKeys(paramsWithoutCredentials), result: errored ? 'ERROR' : 'SUCCESS' },
        application.id,
        `${connectionId}-create`
      );

      // TODO remove this after all customers migrate to the svix webhooks
      if (application.config.webhook) {
        await maybeSendWebhookPayload(
          application.config.webhook,
          errored ? 'CONNECTION_ERROR' : 'CONNECTION_SUCCESS',
          params
        );
      }
    }
  }

  public async delete(id: string, applicationId: string, customerId: string): Promise<void> {
    let errored = false;
    const connection = await this.#prisma.connection.findFirst({
      where: {
        id,
        provider: {
          applicationId,
        },
        customerId,
      },
      include: {
        syncs: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!connection) {
      throw new NotFoundError(`Could not find connection ${id} with application id ${applicationId}`);
    }

    try {
      await this.#prisma.$transaction([
        // Delete the object syncs, if they exist
        ...connection.syncs.flatMap((sync) => [
          this.#prisma.sync.delete({
            where: {
              id: sync.id,
            },
          }),
          this.#prisma.syncChange.create({
            data: {
              syncId: sync.id,
            },
          }),
        ]),
        this.#prisma.connection.delete({
          where: {
            id,
          },
        }),
      ]);
    } catch (e) {
      errored = true;
      throw e;
    } finally {
      await this.#webhookService.sendMessage(
        'connection.deleted',
        {
          connection_id: id,
          customer_id: connection.customerId,
          provider_id: connection.providerId,
          category: connection.category as ProviderCategory,
          provider_name: connection.providerName as ProviderName,
          result: errored ? 'ERROR' : 'SUCCESS',
        },
        applicationId,
        `${id}-delete`
      );
    }
  }

  async #triggerProcessSyncChangesTemporalSchedule(): Promise<void> {
    const handle = this.#temporalClient.schedule.getHandle(PROCESS_SYNC_CHANGES_SCHEDULE_ID);
    await handle.trigger(ScheduleOverlapPolicy.BUFFER_ONE);
  }

  public async upsertProcessSyncChangesTemporalSchedule(): Promise<void> {
    const intervals = [
      {
        every: 10 * 1000, // 10 seconds
      },
    ];
    try {
      await this.#temporalClient.schedule.create({
        scheduleId: PROCESS_SYNC_CHANGES_SCHEDULE_ID,
        spec: {
          intervals,
        },
        action: {
          type: 'startWorkflow',
          workflowType: processSyncChanges,
          workflowId: PROCESS_SYNC_CHANGES_WORKFLOW_ID,
          taskQueue: SYNC_TASK_QUEUE,
          args: [{}],
        },
      });
    } catch (err: unknown) {
      if (err instanceof ScheduleAlreadyRunning) {
        const handle = this.#temporalClient.schedule.getHandle(PROCESS_SYNC_CHANGES_SCHEDULE_ID);
        await handle.update((prev) => {
          return {
            ...prev,
            spec: {
              intervals,
            },
          };
        });
        return;
      }

      throw err;
    }
  }

  public async manuallyFixTemporalSyncs(): Promise<{
    scheduleIdsDeleted: string[];
    workflowIdsTerminated: string[];
    scheduleIdsCreated: string[];
  }> {
    throw new Error('Not functioning during v1 to v2 migration');

    // // Find all the syncs in our DB
    // // TODO: paginate
    // const syncs = await this.#prisma.sync.findMany({
    //   select: {
    //     id: true,
    //     connectionId: true,
    //   },
    // });
    // const expectedSyncIds = syncs.map((sync) => sync.id);
    // const expectedScheduleIds = expectedSyncIds.map(getRunSyncScheduleId);
    // const expectedWorkflowIdPrefixes = expectedSyncIds.map(getRunSyncWorkflowId);

    // // List out all the schedules in Temporal
    // const scheduleIdsDeleted: string[] = [];
    // for await (const schedule of this.#temporalClient.schedule.list()) {
    //   // If the corresponding sync is not in our DB, delete it
    //   // TODO: for some reason `schedule.action` is undefined for `runSync` schedules, but not in tctl
    //   if (schedule.scheduleId.startsWith(RUN_SYNC_PREFIX) && !expectedScheduleIds.includes(schedule.scheduleId)) {
    //     const handle = this.#temporalClient.schedule.getHandle(schedule.scheduleId);
    //     await handle.delete();
    //     scheduleIdsDeleted.push(schedule.scheduleId);
    //   }
    // }

    // // List out all the workflows in Temporal
    // const workflowIdsTerminated: string[] = [];
    // for await (const workflow of this.#temporalClient.workflow.list()) {
    //   if (workflow.status.name !== 'RUNNING') {
    //     continue;
    //   }
    //   // If the corresponding sync is not in our DB, delete it
    //   if (
    //     workflow.workflowId.startsWith(RUN_SYNC_PREFIX) &&
    //     !expectedWorkflowIdPrefixes.some((prefix) => workflow.workflowId.startsWith(prefix))
    //   ) {
    //     const handle = this.#temporalClient.workflow.getHandle(workflow.workflowId);
    //     try {
    //       await handle.terminate('could not find corresponding sync in DB');
    //       workflowIdsTerminated.push(workflow.workflowId);
    //     } catch (err) {
    //       if (err instanceof WorkflowNotFoundError) {
    //         // swallow
    //       }
    //     }
    //   }
    // }

    // // Upsert schedules in case
    // const connectionIds = syncs.map((sync) => sync.connectionId);
    // const connections = await this.#connectionService.getSafeByIds(connectionIds);

    // // Get the integrations
    // const integrationIds = connections.map((connection) => connection.integrationId);
    // const integrations = await this.#integrationService.getByIds(integrationIds);

    // // Upsert schedules for all the syncs (currently ignores updating periodMs)
    // const scheduleIdsCreated: string[] = [];
    // for (const syncId of expectedSyncIds) {
    //   const sync = syncs.find((sync) => sync.id === syncId);
    //   if (!sync) {
    //     throw new Error('Unexpected error: sync not found');
    //   }
    //   const connection = connections.find((connection) => connection.id === sync.connectionId);
    //   if (!connection) {
    //     throw new Error('Unexpected error: connection not found');
    //   }
    //   const integration = integrations.find((integration) => integration.id === connection.integrationId);
    //   if (!integration) {
    //     throw new Error('Unexpected error: integration not found');
    //   }
    //   const justCreated = await this.#createTemporalSyncIfNotExist(
    //     syncId,
    //     connection,
    //     integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS
    //   );

    //   if (justCreated) {
    //     scheduleIdsCreated.push(getRunSyncScheduleId(syncId));
    //   }
    // }

    // return {
    //   scheduleIdsDeleted,
    //   workflowIdsTerminated,
    //   scheduleIdsCreated,
    // };
  }

  // async #createTemporalSyncIfNotExist(
  //   syncId: string,
  //   connection: ConnectionSafeAny,
  //   syncPeriodMs: number
  // ): Promise<boolean> {
  //   const scheduleId = getRunSyncScheduleId(syncId);
  //   const interval: IntervalSpec = {
  //     every: syncPeriodMs,
  //     // so that not everybody is refreshing and hammering the DB at the same time
  //     offset: Math.random() * syncPeriodMs,
  //   };
  //   const action: Omit<ScheduleOptionsAction, 'workflowId'> & { workflowId: string } = {
  //     type: 'startWorkflow' as const,
  //     workflowType: runSync,
  //     workflowId: getRunSyncWorkflowId(syncId),
  //     taskQueue: SYNC_TASK_QUEUE,
  //     args: [
  //       {
  //         syncId,
  //         connectionId: connection.id,
  //         category: connection.category,
  //         context: {
  //           [TEMPORAL_CONTEXT_ARGS.SYNC_ID]: syncId,
  //           [TEMPORAL_CONTEXT_ARGS.APPLICATION_ID]: connection.applicationId,
  //           [TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID]: connection.customerId,
  //           [TEMPORAL_CONTEXT_ARGS.PROVIDER_ID]: connection.providerId,
  //           [TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY]: connection.category,
  //           [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
  //         },
  //       },
  //     ],
  //     searchAttributes: {
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [syncId],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CONNECTION_ID]: [connection.id],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_CATEGORY]: [connection.category],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_NAME]: [connection.providerName],
  //     },
  //   };

  //   try {
  //     await this.#temporalClient.schedule.create({
  //       scheduleId,
  //       spec: {
  //         intervals: [interval],
  //       },
  //       action,
  //       state: {
  //         triggerImmediately: true,
  //       },
  //     });
  //   } catch (err: unknown) {
  //     if (err instanceof ScheduleAlreadyRunning) {
  //       const handle = this.#temporalClient.schedule.getHandle(scheduleId);
  //       await handle.update((prev) => {
  //         const newInterval = prev.spec.intervals?.[0]?.every === syncPeriodMs ? prev.spec.intervals[0] : interval;

  //         return {
  //           ...prev,
  //           spec: {
  //             intervals: [newInterval],
  //           },
  //           action,
  //         };
  //       });

  //       return false;
  //     }

  //     throw err;
  //   }

  //   return true;
  // }
}
