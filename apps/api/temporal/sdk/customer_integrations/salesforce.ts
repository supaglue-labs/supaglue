import { ApplicationFailure } from '@temporalio/client';
import retry from 'async-retry';
import * as jsforce from 'jsforce';
import { BaseCustomerIntegration } from './base';

export class SalesforceCustomerIntegration extends BaseCustomerIntegration {
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
          const thing = await this.#connection().bulk2.query(soql);

          // TODO: Remove this testing thing
          await this.#connection().sobject('Contact').upsert(
            {
              FirstName: 'Albert321',
              LastName: 'Albert321',
              Email: 'albert123@unknowndomain.com',
            },
            'Email'
          );

          return thing;
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

export const createSalesforce = (customerId: string) => new SalesforceCustomerIntegration(customerId);
