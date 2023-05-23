import { ConnectionSafeAny, S3Destination } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { Readable } from 'stream';
import { BaseDestinationWriter, WriteCommonModelsResult } from './base';

export class S3DestinationWriter extends BaseDestinationWriter {
  readonly #destination: S3Destination;

  public constructor(destination: S3Destination) {
    super();
    this.#destination = destination;
  }

  public override async writeObjects(
    { id: connectionId, providerName, customerId }: ConnectionSafeAny,
    commonModelType: CRMCommonModelType,
    inputStream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult> {
    throw new Error('Method not implemented.');
  }
}
