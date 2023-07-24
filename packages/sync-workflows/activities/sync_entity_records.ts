import type { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import type { ConnectionService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import type { DestinationService } from '@supaglue/core/services/destination_service';
import type { EntityService } from '@supaglue/core/services/entity_service';
import { ApplicationFailure, Context } from '@temporalio/activity';
import type { Readable } from 'stream';
import { pipeline, Transform } from 'stream';
import { logEvent } from '../lib/analytics';
import type { ApplicationService, SyncService } from '../services';

export type SyncEntityRecordsArgs = {
  syncId: string;
  connectionId: string;
  entityId: string;
  updatedAfterMs?: number;
};

export type SyncEntityRecordsResult = {
  syncId: string;
  connectionId: string;
  entityId: string;
  maxLastModifiedAtMs: number | null;
  numRecordsSynced: number;
};

export function createSyncEntityRecords(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  destinationService: DestinationService,
  syncService: SyncService,
  syncConfigService: SyncConfigService,
  applicationService: ApplicationService,
  entityService: EntityService
) {
  return async function syncEntityRecords({
    syncId,
    connectionId,
    entityId,
    updatedAfterMs,
  }: SyncEntityRecordsArgs): Promise<SyncEntityRecordsResult> {
    const sync = await syncService.getSyncById(syncId);
    const syncConfig = await syncConfigService.getById(sync.syncConfigId);
    const connection = await connectionService.getSafeById(connectionId);
    const entity = await entityService.getById(entityId);

    async function writeObjects(writer: DestinationWriter) {
      const client = await remoteService.getRemoteClient(connectionId);
      const { object, fieldMappingConfig } = await connectionService.getObjectAndFieldMappingConfigForEntity(
        connectionId,
        entityId
      );
      switch (object.type) {
        case 'standard': {
          const stream = await client.listStandardObjectRecords(
            object.name,
            fieldMappingConfig,
            updatedAfter,
            heartbeat
          );
          return await writer.writeEntityRecords(connection, entity.name, toHeartbeatingReadable(stream), heartbeat);
        }
        case 'custom': {
          // TODO: We shouldn't support custom objects until we decide how to generally
          // reference custom objects across our system (APIs, syncs, etc.)
          throw ApplicationFailure.nonRetryable('Custom objects are not supported yet');
          // const stream = await client.listCustomObjectRecords(object.name, updatedAfter, heartbeat);
          // return await writer.writeEntityRecords(connection, entity.name, toHeartbeatingReadable(stream), heartbeat);
        }
      }
    }

    const application = await applicationService.getById(connection.applicationId);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Start Sync',
      syncId: syncId,
      providerName: connection.providerName,
      entityId,
    });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const writer = await destinationService.getWriterByDestinationId(syncConfig.destinationId);
    if (!writer) {
      throw ApplicationFailure.nonRetryable(`No destination found for id ${syncConfig.destinationId}`);
    }

    const result = await writeObjects(writer);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Partially Completed Sync',
      syncId: syncId,
      providerName: connection.providerName,
      entityId,
    });

    return {
      syncId: syncId,
      connectionId,
      entityId,
      maxLastModifiedAtMs: result.maxLastModifiedAt ? result.maxLastModifiedAt.getTime() : null,
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
