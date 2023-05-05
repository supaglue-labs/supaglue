import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { EngagementRemoteClient } from '@supaglue/core/remotes/engagement/base';
import { CommonModelBaseService, ConnectionService, RemoteService } from '@supaglue/core/services';
import {
  AccountService,
  ContactService,
  EventService,
  LeadService,
  OpportunityService,
  UserService,
} from '@supaglue/core/services/common_models/crm';
import { ContactService as EngagementContactService } from '@supaglue/core/services/common_models/engagement';
import { CommonModel, CRMCommonModelType, IntegrationCategory } from '@supaglue/types';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import { Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';

export type ImportRecordsArgs = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModel;
  updatedAfterMs?: number;
};

export type ImportRecordsResult = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModel;
  maxLastModifiedAtMs: number;
  numRecordsSynced: number;
};

export function createImportRecords(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  crm: {
    accountService: AccountService;
    contactService: ContactService;
    opportunityService: OpportunityService;
    leadService: LeadService;
    userService: UserService;
    eventService: EventService;
  },
  engagement: {
    contactService: EngagementContactService;
  }
) {
  function getService(
    category: IntegrationCategory,
    commonModel: CRMCommonModelType | EngagementCommonModelType
  ): CommonModelBaseService {
    switch (category) {
      case 'crm':
        switch (commonModel) {
          case 'account':
            return crm.accountService;
          case 'contact':
            return crm.contactService;
          case 'event':
            return crm.eventService;
          case 'lead':
            return crm.leadService;
          case 'opportunity':
            return crm.opportunityService;
          case 'user':
            return crm.userService;
          default:
            throw new Error(`Common model ${commonModel} not supported for crm category`);
        }
      case 'engagement':
        switch (commonModel) {
          case 'contact':
            return engagement.contactService;
          default:
            throw new Error(`Common model ${commonModel} not supported for engagement category`);
        }
    }
  }

  return async function importRecords({
    syncId,
    connectionId,
    commonModel,
    updatedAfterMs,
  }: ImportRecordsArgs): Promise<ImportRecordsResult> {
    const connection = await connectionService.getSafeById(connectionId);

    let result = {
      maxLastModifiedAt: null as Date | null,
      numRecords: 0,
    };

    logEvent({ eventName: 'Start Sync', syncId, providerName: connection.providerName, modelName: commonModel });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const client = await remoteService.getRemoteClient(connectionId);
    let readable: Readable;
    // TODO: Have better type-safety
    if (client.category() === 'crm') {
      readable = await (client as CrmRemoteClient).listObjects(commonModel as CRMCommonModelType, updatedAfter);
    } else {
      readable = await (client as EngagementRemoteClient).listObjects(
        commonModel as EngagementCommonModelType,
        updatedAfter
      );
    }

    const service = getService(connection.category, commonModel);
    result = await service.upsertRemoteRecords(
      connection.id,
      connection.customerId,
      toHeartbeatingReadable(readable),
      onUpsertBatchCompletion
    );

    logEvent({
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

function onUpsertBatchCompletion(offset: number, numRecords: number) {
  Context.current().heartbeat();
}
