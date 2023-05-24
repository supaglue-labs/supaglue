import type { CommonModel, ConnectionSafeAny } from '@supaglue/types';
import type { Readable } from 'stream';

export type WriteCommonModelsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export interface DestinationWriter {
  writeObjects(
    connection: ConnectionSafeAny,
    commonModelType: CommonModel,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelsResult>;
}

export abstract class BaseDestinationWriter implements DestinationWriter {
  abstract writeObjects(
    connection: ConnectionSafeAny,
    commonModelType: CommonModel,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelsResult>;
}
