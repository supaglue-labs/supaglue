import { ApplicationFailure } from '@temporalio/common';
import { getDependencyContainer } from '../../dependency_container';
import {
  InboundSyncConfig,
  PostgresDestination,
  SyncConfig,
  WebhookDestination,
} from '../../developer_config/entities';
import { InboundSync, Sync } from '../../syncs/entities';
import { createSupaglue, Supaglue } from '../sdk';

type DoSyncArgs = {
  syncId: string;
  syncRunId: string;
};

export async function doSync({ syncId, syncRunId }: DoSyncArgs): Promise<void> {
  const { syncService, developerConfigService } = getDependencyContainer();

  // TODO: Simplify
  // Get sync and developer config
  const sync = await syncService.getSyncById(syncId);

  // TODO: remove this when we support outbound sync too
  if (sync.type !== 'inbound') {
    throw ApplicationFailure.nonRetryable('We only support inbound syncs right now');
  }

  const developerConfig = await developerConfigService.getDeveloperConfig();
  const syncConfig = developerConfig.getSyncConfig(sync.syncConfigName);

  // TODO: remove this when we support outbound sync too
  if (syncConfig.type !== 'inbound') {
    throw ApplicationFailure.nonRetryable('We only support inbound sync configs right now');
  }

  // Instantiate the SDK and then pass it around
  const sg = createSupaglue(sync.customerId);

  return await doSyncImpl(sg, sync, syncConfig, syncRunId);
}

async function doSyncImpl(
  sg: Supaglue,
  sync: InboundSync,
  syncConfig: InboundSyncConfig,
  syncRunId: string
): Promise<void> {
  const fieldMapping = getMapping(sync, syncConfig);

  // Fetch external records
  const records = await readRecordsFromSource(sg, syncConfig, fieldMapping);

  // Write the internal records
  await writeRecordsToDestination(sg, { sync, syncConfig, fieldMapping, records, syncRunId });
}

function getMapping(
  { fieldMapping }: Sync,
  { destination, defaultFieldMapping }: InboundSyncConfig
): Record<string, string> {
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
  sg: Supaglue,
  syncConfig: SyncConfig,
  mapping: Record<string, string>
): Promise<Record<string, string>[]> {
  // Read from source
  const salesforceFields = [...Object.values(mapping), 'SystemModstamp']; // TODO: Do not fetch SystemModstamp twice if already in mapping.
  const salesforceFieldsString = salesforceFields.join(', ');

  // Fetching in ASC order for incremental sync in the future.
  const soql = `SELECT ${salesforceFieldsString} FROM ${syncConfig.salesforceObject} ORDER BY SystemModstamp ASC`;

  return await sg.customerIntegrations.salesforce.query(soql);
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

async function writeRecordsToDestination(
  sg: Supaglue,
  {
    syncConfig,
    sync,
    fieldMapping,
    records,
    syncRunId,
  }: {
    sync: Sync;
    syncConfig: InboundSyncConfig;
    fieldMapping: Record<string, string>;
    records: Record<string, unknown>[];
    syncRunId: string;
  }
): Promise<void> {
  const { destination } = syncConfig;

  // Apply mapping
  const mappedRecords = applyMapping(fieldMapping, records);
  if (!mappedRecords.length) {
    throw new Error('No records to write');
  }

  if (destination.type === 'postgres') {
    return await writeRecordsToPostgres(sg, {
      destination,
      fieldMapping,
      mappedRecords,
      customerId: sync.customerId,
    });
  }

  return await writeRecordsToWebhook(sg, {
    destination,
    syncConfigName: syncConfig.name,
    syncId: sync.id,
    syncRunId,
    customerId: sync.customerId,
    mappedRecords,
  });
}

async function writeRecordsToPostgres(
  sg: Supaglue,
  {
    destination,
    fieldMapping,
    mappedRecords,
    customerId,
  }: {
    destination: PostgresDestination;
    fieldMapping: Record<string, string>;
    mappedRecords: Record<string, unknown>[];
    customerId: string;
  }
): Promise<void> {
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
    await sg.internalIntegrations.postgres.query(
      destination,
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
  }
}

async function writeRecordsToWebhook(
  sg: Supaglue,
  {
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
  }
) {
  // TODO: Batch calls to webhook? Maybe have webhook expect a different payload structure.
  for (const record of mappedRecords) {
    sg.internalIntegrations.webhook.request(destination, syncConfigName, syncId, syncRunId, customerId, record);
  }
}
