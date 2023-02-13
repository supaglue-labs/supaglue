import { WebhookDestination } from '@supaglue/types';
import { ApplicationFailure } from '@temporalio/client';
import retry from 'async-retry';
import axios from 'axios';
import { getMapping, mapCustomerToInternalRecords } from '../../lib';
import { BaseInternalIntegration } from './base';

class WebhookInternalIntegration extends BaseInternalIntegration {
  public constructor(...args: ConstructorParameters<typeof BaseInternalIntegration>) {
    super(...args);
  }

  public async request(
    destination: WebhookDestination, // TODO: shouldn't need to pass this in at query time
    syncConfigName: string, // TODO: should inject this in instead
    syncId: string,
    syncRunId: string,
    customerId: string,
    record: Record<string, unknown>
  ): Promise<void> {
    try {
      await retry(async () => {
        const timestamp = new Date();
        const metadata = {
          timestamp,
          syncConfigName,
          syncId,
          syncRunId,
          customerId,
          host: process.env.SUPAGLUE_API_SERVER_URL,
        };
        const { url, requestType, headers } = destination.config;

        const axiosRequest = {
          data: { record, metadata },
          headers: headers ? axios.AxiosHeaders.accessor(headers) : undefined,
        };

        switch (requestType) {
          case 'GET':
            return await axios.get(url, axiosRequest);
          case 'POST':
            return await axios.post(url, axiosRequest);
          case 'PATCH':
            return await axios.patch(url, axiosRequest);
          case 'PUT':
            return await axios.put(url, axiosRequest);
          case 'DELETE':
            return await axios.delete(url, axiosRequest);
          default:
            throw new Error(`Unsupported requestType: ${requestType}`);
        }
      }, destination.retryPolicy);
    } catch (err: unknown) {
      throw ApplicationFailure.nonRetryable(err instanceof Error ? err.message : '', 'sync_destination_error');
    }
  }
}

export class DestinationWebhookInternalIntegration extends WebhookInternalIntegration {
  public async sendRequests(records: any[]) {
    const { sync, syncConfig, syncRunId } = this;
    const fieldMapping = getMapping(sync, syncConfig);
    const internalRecords = mapCustomerToInternalRecords(fieldMapping, records);
    if (!internalRecords.length) {
      throw new Error('No records to write');
    }
    for (const record of internalRecords) {
      await this.request(
        syncConfig.destination as WebhookDestination, // TODO: make the class take in a generic for SyncConfig instead of asserting
        syncConfig.name,
        sync.id,
        syncRunId,
        sync.customerId,
        record
      );
    }
  }
}
