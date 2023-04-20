import { ConnectionSafeAny } from '@supaglue/types';
import type { Readable } from 'stream';

export type WriteCommonModelsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export interface DestinationWriter {
  writeAccounts(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  writeContacts(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  writeLeads(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  writeOpportunities(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  writeUsers(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  writeEvents(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
}

export abstract class BaseDestinationWriter implements DestinationWriter {
  abstract writeAccounts(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  abstract writeContacts(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  abstract writeLeads(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  abstract writeOpportunities(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  abstract writeUsers(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
  abstract writeEvents(
    connection: ConnectionSafeAny,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
}
