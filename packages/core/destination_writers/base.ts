import { ConnectionSafeAny, CRMCommonModelType } from '@supaglue/types';
import type { Readable } from 'stream';

export type WriteCommonModelsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export interface DestinationWriter {
  writeObjects(
    connection: ConnectionSafeAny,
    commonModelType: CRMCommonModelType,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
}

export abstract class BaseDestinationWriter implements DestinationWriter {
  abstract writeObjects(
    connection: ConnectionSafeAny,
    commonModelType: CRMCommonModelType,
    stream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult>;
}
