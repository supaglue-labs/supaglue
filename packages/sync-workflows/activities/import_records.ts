import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { EngagementRemoteClient } from '@supaglue/core/remotes/engagement/base';
import { CommonModelBaseService, ConnectionService, RemoteService } from '@supaglue/core/services';
import {
  AccountService,
  ContactService,
  LeadService,
  OpportunityService,
  UserService,
} from '@supaglue/core/services/common_models/crm';
import {
  ContactService as EngagementContactService,
  MailboxService,
  SequenceService,
  UserService as EngagementUserService,
} from '@supaglue/core/services/common_models/engagement';
import { SequenceStateService } from '@supaglue/core/services/common_models/engagement/sequence_state_service';
import { CommonModelType, ProviderCategory } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import { Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { ApplicationService } from 'sync-worker/services';
import { logEvent } from '../lib/analytics';

export type ImportRecordsArgs = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModelType;
  updatedAfterMs?: number;
};

export type ImportRecordsResult = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModelType;
  maxLastModifiedAtMs: number;
  numRecordsSynced: number;
};

export function createImportRecords(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  applicationService: ApplicationService,
  crm: {
    accountService: AccountService;
    contactService: ContactService;
    opportunityService: OpportunityService;
    leadService: LeadService;
    userService: UserService;
  },
  engagement: {
    contactService: EngagementContactService;
    userService: EngagementUserService;
    sequenceService: SequenceService;
    mailboxService: MailboxService;
    sequenceStateService: SequenceStateService;
  }
) {
  function getService(
    category: ProviderCategory,
    commonModel: CRMCommonModelType | EngagementCommonModelType
  ): CommonModelBaseService {
    switch (category) {
      case 'crm':
        switch (commonModel) {
          case 'account':
            return crm.accountService;
          case 'contact':
            return crm.contactService;
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
          case 'user':
            return engagement.userService;
          case 'sequence':
            return engagement.sequenceService;
          case 'mailbox':
            return engagement.mailboxService;
          case 'sequence_state':
            return engagement.sequenceStateService;
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
    const application = await applicationService.getById(connection.applicationId);

    let result = {
      maxLastModifiedAt: null as Date | null,
      numRecords: 0,
    };

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Start Sync',
      syncId,
      providerName: connection.providerName,
      modelName: commonModel,
    });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const client = await remoteService.getRemoteClient(connectionId);
    let readable: Readable;
    // TODO: Have better type-safety
    if (client.category() === 'crm') {
      readable = await (client as CrmRemoteClient).listCommonModelRecords(
        commonModel as CRMCommonModelType,
        updatedAfter,
        heartbeat
      );
    } else {
      readable = await (client as EngagementRemoteClient).listCommonModelRecords(
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

function onUpsertBatchCompletion(offset: number, numRecords: number) {
  Context.current().heartbeat();
}

function heartbeat() {
  Context.current().heartbeat();
}
