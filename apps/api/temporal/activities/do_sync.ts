import { ApplicationFailure } from '@temporalio/activity';
import retry from 'async-retry';
import axios from 'axios';
import jsforce from 'jsforce';
import pg from 'pg';
import { SALESFORCE } from '../../constants';
import { getDependencyContainer } from '../../dependency_container';
import { PostgresDestination, SyncConfig, WebhookDestination } from '../../developer_config/entities';
import { Sync } from '../../syncs/entities';

type DoSyncArgs = {
  syncId: string;
  syncRunId: string;
};

export async function doSync({ syncId, syncRunId }: DoSyncArgs): Promise<void> {
  const { syncService, developerConfigService } = getDependencyContainer();

  // TODO: Simplify
  // Get sync and developer config
  const sync = await syncService.getSyncById(syncId);
  const developerConfig = await developerConfigService.getDeveloperConfig();
  const syncConfig = developerConfig.getSyncConfig(sync.syncConfigName);

  const fieldMapping = getMapping(sync, syncConfig);

  // Fetch external records
  const records = await readRecordsFromSource(sync, syncConfig, fieldMapping);

  // Write the internal records
  await writeRecordsToDestination({ sync, syncConfig, fieldMapping, records, syncRunId });
}

function getMapping({ fieldMapping }: Sync, { destination, defaultFieldMapping }: SyncConfig): Record<string, string> {
  return destination.schema.fields.reduce((mapping: Record<string, string>, { name }) => {
    if (name in mapping) {
      return mapping;
    }
    const field = defaultFieldMapping?.find((mapping) => mapping.name === name)?.field;
    if (field) {
      mapping[name] = field;
    }
    return mapping;
  }, fieldMapping ?? {});
}

async function readRecordsFromSource(
  sync: Sync,
  syncConfig: SyncConfig,
  mapping: Record<string, string>
): Promise<Record<string, string>[]> {
  const { integrationService, developerConfigService } = getDependencyContainer();

  // Set up salesforce connection
  const integration = await integrationService.getByCustomerIdAndType(sync.customerId, SALESFORCE, /* unsafe */ true);
  const developerConfig = await developerConfigService.getDeveloperConfig();
  const oauth2 = new jsforce.OAuth2({
    ...developerConfig.getSalesforceCredentials(),
    redirectUri: `${process.env.SUPAGLUE_API_SERVER_URL}/oauth/callback`,
  });
  const { instanceUrl, refreshToken } = integration.credentials;
  const connection = new jsforce.Connection({ oauth2, instanceUrl, refreshToken, maxRequest: 10 });

  // Read from source
  const salesforceFields = [...Object.values(mapping), 'SystemModstamp']; // TODO: Do not fetch SystemModstamp twice if already in mapping.
  const salesforceFieldsString = salesforceFields.join(', ');

  // Fetching in ASC order for incremental sync in the future.
  const soql = `SELECT ${salesforceFieldsString} FROM ${syncConfig.salesforceObject} ORDER BY SystemModstamp ASC`;

  // TODO: Later, batch it instead of grabbing everything in one query.
  // We'll need to make a change in jsforce to support this. We could manually instantiate
  // `new QueryJobV2()`, but we still need to expose a method on that class to fetch page by page.
  try {
    return await retry(
      async (bail) => {
        // Check first to see if we've exceeded a self-imposed API limit.
        // We cannot use `connection.limitInfo` because the `connection.bulk2.query`
        // call bypasses the response listener that reads the API call limits and
        // caches the limits.
        // TODO: Perhaps we should reconsider using jsforce, or make changes to it.
        const limits = await connection.limits();
        const {
          DailyApiRequests: { Max: maxDailyApiRequests, Remaining: remainingDailyApiRequests },
        } = limits;

        // TODO: clean up
        const salesforceAPIUsageLimitPercentage = sync.salesforceAPIUsageLimitPercentage ?? 100;

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
        return await connection.bulk2.query(soql);
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

function applyMapping(
  mapping: Record<string, string>,
  externalRecords: Record<string, unknown>[]
): Record<string, unknown>[] {
  return externalRecords.map((externalRecord) => {
    const record: Record<string, unknown> = {};

    Object.entries(mapping).forEach(([appField, externalField]) => {
      record[appField] = externalRecord[externalField];
    });

    return record;
  });
}

async function writeRecordsToDestination({
  syncConfig,
  sync,
  fieldMapping,
  records,
  syncRunId,
}: {
  sync: Sync;
  syncConfig: SyncConfig;
  fieldMapping: Record<string, string>;
  records: Record<string, unknown>[];
  syncRunId: string;
}): Promise<void> {
  const { destination } = syncConfig;

  // Apply mapping
  const mappedRecords = applyMapping(fieldMapping, records);
  if (!mappedRecords.length) {
    throw new Error('No records to write');
  }

  if (destination.type === 'postgres') {
    return await writeRecordsToPostgres({
      destination,
      fieldMapping,
      mappedRecords,
      customerId: sync.customerId,
    });
  }

  return await writeRecordsToWebhook({
    destination,
    syncConfigName: syncConfig.name,
    syncId: sync.id,
    syncRunId,
    customerId: sync.customerId,
    mappedRecords,
  });
}

async function writeRecordsToPostgres({
  destination,
  fieldMapping,
  mappedRecords,
  customerId,
}: {
  destination: PostgresDestination;
  fieldMapping: Record<string, string>;
  mappedRecords: Record<string, unknown>[];
  customerId: string;
}): Promise<void> {
  const pool = new pg.Pool(destination.config.credentials);

  // TODO: What do we do if there are columns missing in the source?
  // TODO: Check that there are actually columns to sync over
  const { upsertKey } = destination.config;
  const dbFields = Object.keys(fieldMapping);
  const dbFieldsWithoutPrimaryKey = dbFields.filter((field) => field !== upsertKey);
  const dbFieldsString = dbFields.map((field) => `"${field}"`).join(', ');
  const dbFieldsWithoutPrimaryKeyString = dbFieldsWithoutPrimaryKey.map((field) => `"${field}"`).join(', ');
  const dbFieldsIndexesString = dbFields.map((_, idx) => `$${idx + 1}`).join(', ');
  const dbFieldsIndexesWithoutPrimaryKeyString = dbFields
    .map((field, index) => {
      if (field !== upsertKey) {
        return `$${index + 1}`;
      }
    })
    .filter(Boolean)
    .join(', ');

  // TODO: Do this in batches
  for (const mappedRecord of mappedRecords) {
    const values = dbFields.map((field) => mappedRecord[field] ?? '');

    // TODO: Do we want to deal with updated_at and created_at?
    try {
      await retry(async () => {
        await pool.query(
          `
    INSERT INTO
      ${destination.config.table} (${dbFieldsString}, ${destination.config.customerIdColumn}, created_at, updated_at)
    VALUES
      (${dbFieldsIndexesString}, '${customerId}', now(), now())
    ON CONFLICT (${destination.config.upsertKey}, ${destination.config.customerIdColumn})
    DO
      UPDATE SET (${dbFieldsWithoutPrimaryKeyString}, created_at, updated_at) = (${dbFieldsIndexesWithoutPrimaryKeyString}, now(), now())
    `,
          values
        );
      }, destination.retryPolicy);
    } catch (err: unknown) {
      throw ApplicationFailure.nonRetryable(err instanceof Error ? err.message : '', 'sync_destination_error');
    }
  }
}

async function writeRecordsToWebhook({
  destination,
  syncConfigName,
  syncId,
  syncRunId,
  customerId,
  mappedRecords,
}: {
  destination: WebhookDestination;
  syncConfigName: string;
  mappedRecords: Record<string, unknown>[];
  syncId: string;
  syncRunId: string;
  customerId: string;
}) {
  // TODO: Batch calls to webhook? Maybe have webhook expect a different payload structure.
  for (const record of mappedRecords) {
    try {
      await retry(async () => {
        await writeSingleRecordToWebhook({ destination, syncConfigName, syncId, syncRunId, customerId, record });
      }, destination.retryPolicy);
    } catch (err: unknown) {
      throw ApplicationFailure.nonRetryable(err instanceof Error ? err.message : '', 'sync_destination_error');
    }
  }
}

async function writeSingleRecordToWebhook({
  destination,
  syncConfigName,
  syncId,
  syncRunId,
  customerId,
  record,
}: {
  destination: WebhookDestination;
  syncConfigName: string;
  record: Record<string, unknown>;
  syncId: string;
  syncRunId: string;
  customerId: string;
}) {
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
}
