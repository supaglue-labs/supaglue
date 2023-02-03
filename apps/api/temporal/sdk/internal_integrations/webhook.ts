import { ApplicationFailure } from '@temporalio/client';
import retry from 'async-retry';
import axios from 'axios';
import { WebhookDestination } from '../../../developer_config/entities';
import { BaseInternalIntegration } from './base';

export class WebhookInternalIntegration extends BaseInternalIntegration {
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
