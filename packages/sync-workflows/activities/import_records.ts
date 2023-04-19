import {
  AccountService,
  ConnectionService,
  ContactService,
  EventService,
  LeadService,
  OpportunityService,
  RemoteService,
} from '@supaglue/core/services';
import { CommonModel } from '@supaglue/types';
import { logEvent } from '../lib/analytics';

export type ImportRecordsArgs = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModel;
  updatedAfterMs?: number;
};

export type ImportRecordsResult = {
  maxLastModifiedAtMs: number;
  numRecordsSynced: number;
};

export function createImportRecords(
  accountService: AccountService,
  connectionService: ConnectionService,
  contactService: ContactService,
  remoteService: RemoteService,
  opportunityService: OpportunityService,
  leadService: LeadService,
  eventService: EventService
) {
  return async function importRecords({
    syncId,
    connectionId,
    commonModel,
    updatedAfterMs,
  }: ImportRecordsArgs): Promise<ImportRecordsResult> {
    const connection = await connectionService.getSafeById(connectionId);
    const client = await remoteService.getCrmRemoteClient(connectionId);

    const result = {
      maxLastModifiedAt: null as Date | null,
      numRecords: 0,
    };

    logEvent({ eventName: 'Start Sync', syncId, providerName: connection.providerName, modelName: commonModel });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    switch (commonModel) {
      case 'account': {
        const readable = await client.listAccounts(updatedAfter);
        break;
      }
      case 'contact': {
        const readable = await client.listContacts(updatedAfter);
        break;
      }
      case 'opportunity': {
        const readable = await client.listOpportunities(updatedAfter);
        break;
      }
      case 'lead': {
        const readable = await client.listLeads(updatedAfter);
        break;
      }
      case 'user': {
        const readable = await client.listUsers(updatedAfter);
        break;
      }
      case 'event': {
        const readable = await client.listEvents(updatedAfter);
        break;
      }
    }

    logEvent({
      eventName: 'Partially Completed Sync',
      syncId,
      providerName: connection.providerName,
      modelName: commonModel,
    });

    return {
      maxLastModifiedAtMs: result.maxLastModifiedAt ? result.maxLastModifiedAt.getTime() : 0,
      numRecordsSynced: result.numRecords,
    };
  };
}
