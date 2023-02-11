import { SalesforceDestination, SalesforceSource, Sync, SyncConfig } from '@supaglue/types';
import { ApplicationFailure } from '@temporalio/client';
import retry from 'async-retry';
import * as jsforce from 'jsforce';
import { logger } from '../../../logger';
import { getMapping, getSalesforceObject, mapInternalToCustomerRecords } from '../../lib';
import { BaseCustomerIntegration } from './base';

class CustomerSalesforceIntegration extends BaseCustomerIntegration {
  #connectionInstance: jsforce.Connection | null = null;

  public constructor(...args: ConstructorParameters<typeof BaseCustomerIntegration>) {
    super(...args);
  }

  async #connect(): Promise<void> {
    const { integrationConfig, developerConfig } = await this.getConfigs();
    const { instanceUrl, refreshToken } = integrationConfig.credentials;

    this.#connectionInstance = new jsforce.Connection({
      oauth2: new jsforce.OAuth2({
        ...developerConfig.getSalesforceCredentials(),
        // TODO: This uri might be configured and passed in
        redirectUri: `${process.env.SUPAGLUE_API_SERVER_URL}/oauth/callback`,
      }),
      instanceUrl,
      refreshToken,
      maxRequest: 10,
    });
  }

  #connection(): jsforce.Connection {
    if (!this.#connectionInstance) {
      throw new Error('Salesforce connection not established');
    }

    return this.#connectionInstance;
  }

  public async upsert(salesforceObject: string, upsertKey: string, records: Record<string, unknown>[]): Promise<void> {
    await this.#connect();

    const result = await this.#connection().bulk2.loadAndWaitForResults({
      object: salesforceObject,
      operation: 'upsert',
      externalIdFieldName: upsertKey,
      input: records,
      pollTimeout: 10000,
    });

    const { successfulResults, failedResults } = result;
    logger.info(`Successfully uploaded ${successfulResults.length} of ${records.length} records to salesforce`);

    if (failedResults.length) {
      logger.error(`Error uploading ${failedResults.length} records to salesforce: ${JSON.stringify(failedResults)}`);
    }
  }

  public async query(soql: string): Promise<jsforce.Record[]> {
    await this.#connect();

    // TODO: Later, batch it instead of grabbing everything in one query.
    // We'll need to make a change in jsforce to support this. We could manually instantiate
    // `new QueryJobV2()`, but we still need to expose a method on that class to fetch page by page.
    try {
      // TODO: Abstract out retry to be useful across all customer integrations.
      return await retry(
        async (bail) => {
          // Check first to see if we've exceeded a self-imposed API limit.
          // We cannot use `connection.limitInfo` because the `connection.bulk2.query`
          // call bypasses the response listener that reads the API call limits and
          // caches the limits.
          // TODO: Perhaps we should reconsider using jsforce, or make changes to it.
          const limits = await this.#connection().limits();
          const {
            DailyApiRequests: { Max: maxDailyApiRequests, Remaining: remainingDailyApiRequests },
          } = limits;

          // TODO: actually read in api usage limit from config
          const salesforceAPIUsageLimitPercentage = 80;

          if (
            (maxDailyApiRequests - remainingDailyApiRequests) / maxDailyApiRequests >
            salesforceAPIUsageLimitPercentage / 100
          ) {
            const err = ApplicationFailure.nonRetryable(
              'self-imposed salesforce API usage limit exceeded',
              'sync_source_error'
            );

            // Purely to match return signature
            // https://github.com/vercel/async-retry/issues/69
            bail(err);
            return [];
          }

          // TODO: For client-side errors, we should bail immediately and fail the sync instead of retrying.
          return await this.#connection().bulk2.query(soql);
        },
        {
          retries: 5,
        }
      );
    } catch (err: unknown) {
      if (err instanceof ApplicationFailure && err.nonRetryable) {
        throw err;
      }
      throw ApplicationFailure.nonRetryable(err instanceof Error ? err.message : '', 'sync_source_error');
    }
  }
}

export class CustomerSalesforceSourceIntegration extends CustomerSalesforceIntegration {
  public async bulkReadSObject() {
    const { sync, syncConfig } = this;
    const fieldMapping = getMapping(sync, syncConfig);
    const salesforceFields = [...Object.values(fieldMapping), 'SystemModstamp']; // TODO: Do not fetch SystemModstamp twice if already in mapping.
    const salesforceFieldsString = salesforceFields.join(', ');

    // TODO: make the class take in a generic for SyncConfig instead of asserting
    const salesforceObject = getSalesforceObject(syncConfig.source as SalesforceSource, sync);

    // Fetching in ASC order for incremental sync in the future.
    const soql = `SELECT ${salesforceFieldsString} FROM ${salesforceObject} ORDER BY SystemModstamp ASC`;

    return await this.query(soql);
  }
}

export class CustomerSalesforceDestinationIntegration extends CustomerSalesforceIntegration {
  public async upsertAllRecords(records: any[]) {
    const { sync, syncConfig } = this;
    const fieldMapping = getMapping(sync, syncConfig);
    const customerRecords = mapInternalToCustomerRecords(fieldMapping, records);
    if (!customerRecords.length) {
      throw new Error('No records to write');
    }
    // TODO: make the class take in a generic for SyncConfig instead of asserting
    const destination = syncConfig.destination as SalesforceDestination;
    // TODO: Validate / throw error?
    // Apply mapping to upsert key
    const salesforceUpsertKey = fieldMapping[destination.upsertKey];

    const salesforceObject = getSalesforceObject(destination, sync);

    await this.upsert(salesforceObject, salesforceUpsertKey, customerRecords);
  }
}

export const createSourceSalesforce = (sync: Sync, syncConfig: SyncConfig, syncRunId: string) =>
  new CustomerSalesforceSourceIntegration(sync, syncConfig, syncRunId);
export const createDestinationSalesforce = (sync: Sync, syncConfig: SyncConfig, syncRunId: string) =>
  new CustomerSalesforceDestinationIntegration(sync, syncConfig, syncRunId);
