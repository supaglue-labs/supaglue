import { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { createFieldMappingConfig } from '@supaglue/core/lib/schema';
import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { EngagementRemoteClient } from '@supaglue/core/remotes/engagement/base';
import { ConnectionService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { CommonModelType } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import { ApplicationFailure, Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';
import { ApplicationService, SyncService } from '../services';

export type SyncRecordsToDestinationArgs = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModelType;
  updatedAfterMs?: number;
};

export type SyncRecordsToDestinationResult = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModelType;
  maxLastModifiedAtMs: number;
  numRecordsSynced: number;
};

export function createSyncCommonRecordsToDestination(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  destinationService: DestinationService,
  syncConfigService: SyncConfigService,
  applicationService: ApplicationService,
  syncService: SyncService
) {
  return async function syncCommonRecordsToDestination({
    syncId,
    connectionId,
    commonModel,
    updatedAfterMs,
  }: SyncRecordsToDestinationArgs): Promise<SyncRecordsToDestinationResult> {
    const syncConfig = await syncConfigService.getBySyncId(syncId);
    async function writeObjects(writer: DestinationWriter) {
      // TODO: Have better type-safety
      if (client.category() === 'crm') {
        const sync = await syncService.getSyncById(syncId);
        const schema = syncConfig?.config?.standardObjects?.find((o) => o.object === commonModel)?.schema;
        const customerFieldMapping = sync.schemaMappingsConfig?.commonObjects?.find(
          (o) => o.object === commonModel
        )?.fieldMappings;
        const fieldMappingConfig = createFieldMappingConfig(schema, customerFieldMapping);
        const readable = await (client as CrmRemoteClient).listCommonObjectRecords(
          commonModel as CRMCommonModelType,
          fieldMappingConfig,
          updatedAfter,
          heartbeat
        );
        return await writer.writeCommonModelRecords(
          connection,
          commonModel as CRMCommonModelType,
          toHeartbeatingReadable(readable),
          heartbeat
        );
      } else {
        const readable = await (client as EngagementRemoteClient).listCommonObjectRecords(
          commonModel as EngagementCommonModelType,
          updatedAfter
        );
        return await writer.writeCommonModelRecords(
          connection,
          commonModel as EngagementCommonModelType,
          toHeartbeatingReadable(readable),
          heartbeat
        );
      }
    }

    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Start Sync',
      syncId,
      providerName: connection.providerName,
      modelName: commonModel,
    });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const client = await remoteService.getRemoteClient(connectionId);

    const writer = await destinationService.getWriterBySyncId(syncId);
    if (!writer) {
      throw ApplicationFailure.nonRetryable(`No destination found for sync ${syncId}`);
    }

    const result = await writeObjects(writer);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Partially Completed Sync',
      syncId,
      providerName: connection.providerName,
      modelName: commonModel,
    });

    return {
      syncId,
      connectionId,
      commonModel,
      maxLastModifiedAtMs: result.maxLastModifiedAt ? result.maxLastModifiedAt.getTime() : 0,
      numRecordsSynced: result.numRecords,
    };
  };
}

function toHeartbeatingReadable(readable: Readable): Readable {
  // TODO: While this ensures rescheduling of this activity if the process dies,
  // it does not ensure that we stop the stream processing.
  // We need to include a timeout here to clean up the pipeline when we
  // exceed the heartbeat timeout.
  return pipeline(
    readable,
    new Transform({
      objectMode: true,
      transform: (chunk, encoding, callback) => {
        Context.current().heartbeat();
        try {
          callback(null, chunk);
        } catch (e: any) {
          return callback(e);
        }
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}
  );
}

function heartbeat() {
  Context.current().heartbeat();
}
