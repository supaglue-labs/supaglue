import { ApplicationFailure } from '@temporalio/common';
import { getDependencyContainer } from '../../dependency_container';
import {
  InboundSyncConfig,
  OutboundSyncConfig,
  PostgresDestination,
  PostgresSource,
  SalesforceCustomerIntegration,
  SyncConfig,
  WebhookDestination,
} from '../../developer_config/entities';
import { InboundSync, OutboundSync, Sync } from '../../syncs/entities';
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

  const developerConfig = await developerConfigService.getDeveloperConfig();
  const syncConfig = developerConfig.getSyncConfig(sync.syncConfigName);

  // Instantiate the SDK and then pass it around
  const sg = createSupaglue(sync.customerId);

  return await doSyncImpl(sg, sync, syncConfig, syncRunId);
}

async function doSyncImpl(sg: Supaglue, sync: Sync, syncConfig: SyncConfig, syncRunId: string): Promise<void> {
  // TODO: Do we need `type` on both `Sync` and `SyncConfig`? We should consider
  // only having it on `SyncConfig` for consistency.
  if (sync.type === 'inbound' && syncConfig.type === 'inbound') {
    return doInboundSync(sg, sync, syncConfig, syncRunId);
  }

  if (sync.type === 'outbound' && syncConfig.type === 'outbound') {
    return doOutboundSync(sg, sync, syncConfig, syncRunId);
  }

  throw ApplicationFailure.nonRetryable('Sync and SyncConfig types do not match');
}

async function doInboundSync(
  sg: Supaglue,
  sync: InboundSync,
  syncConfig: InboundSyncConfig,
  syncRunId: string
): Promise<void> {
  const fieldMapping = getMapping(sync, syncConfig);

  // Fetch external records
  const records = await readRecordsFromCustomerIntegration(sg, syncConfig, sync, fieldMapping);

  // Write the internal records
  await writeRecordsToInternalIntegration(sg, { sync, syncConfig, fieldMapping, records, syncRunId });
}

async function doOutboundSync(
  sg: Supaglue,
  sync: OutboundSync,
  syncConfig: OutboundSyncConfig,
  syncRunId: string
): Promise<void> {
  const fieldMapping = getMapping(sync, syncConfig);

  // Fetch internal records
  const records = await readRecordsFromInternalIntegration(sg, syncConfig);

  // Write the external records
  await writeRecordsToCustomerIntegration(sg, { sync, syncConfig, fieldMapping, records, syncRunId });
}

function getMapping({ fieldMapping }: Sync, syncConfig: SyncConfig): Record<string, string> {
  const schema = syncConfig.type === 'inbound' ? syncConfig.destination.schema : syncConfig.source.schema;
  const { defaultFieldMapping } = syncConfig;

  return schema.fields.reduce((mapping: Record<string, string>, { name }) => {
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

async function readRecordsFromCustomerIntegration(
  sg: Supaglue,
  syncConfig: InboundSyncConfig,
  sync: InboundSync,
  mapping: Record<string, string>
): Promise<Record<string, string>[]> {
  // Read from source
  const salesforceFields = [...Object.values(mapping), 'SystemModstamp']; // TODO: Do not fetch SystemModstamp twice if already in mapping.
  const salesforceFieldsString = salesforceFields.join(', ');

  const salesforceObject = getSalesforceObject(syncConfig.source, sync);

  // Fetching in ASC order for incremental sync in the future.
  const soql = `SELECT ${salesforceFieldsString} FROM ${salesforceObject} ORDER BY SystemModstamp ASC`;

  return await sg.customerIntegrations.salesforce.query(soql);
}

function mapCustomerToInternalRecords(
  mapping: Record<string, string>,
  customerRecords: Record<string, unknown>[]
): Record<string, unknown>[] {
  return customerRecords.map((customerRecord) => {
    const internalRecord: Record<string, unknown> = {};

    Object.entries(mapping).forEach(([internalField, customerField]) => {
      internalRecord[internalField] = customerRecord[customerField];
    });

    return internalRecord;
  });
}

async function writeRecordsToInternalIntegration(
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
  const internalRecords = mapCustomerToInternalRecords(fieldMapping, records);
  if (!internalRecords.length) {
    throw new Error('No records to write');
  }

  if (destination.type === 'postgres') {
    return await writeRecordsToPostgres(sg, {
      destination,
      fieldMapping,
      internalRecords: internalRecords,
      customerId: sync.customerId,
    });
  }

  return await writeRecordsToWebhook(sg, {
    destination,
    syncConfigName: syncConfig.name,
    syncId: sync.id,
    syncRunId,
    customerId: sync.customerId,
    mappedRecords: internalRecords,
  });
}

async function writeRecordsToPostgres(
  sg: Supaglue,
  {
    destination,
    fieldMapping,
    internalRecords,
    customerId,
  }: {
    destination: PostgresDestination;
    fieldMapping: Record<string, string>;
    internalRecords: Record<string, unknown>[];
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
  for (const mappedRecord of internalRecords) {
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

async function readRecordsFromInternalIntegration(
  sg: Supaglue,
  { source }: OutboundSyncConfig
): Promise<Record<string, string>[]> {
  if (source.type === 'postgres') {
    return await readRecordsFromInternalPostgres(sg, source);
  }

  throw new Error(`Unsupported internal source: ${source.type}`);
}

async function readRecordsFromInternalPostgres(
  sg: Supaglue,
  postgres: PostgresSource
): Promise<Record<string, string>[]> {
  // Read from source
  const dbFields = postgres.schema.fields.map((field) => field.name);
  const dbFieldsString = dbFields.join(', ');

  const sql = `SELECT
  ${dbFieldsString}
FROM ${postgres.config.table}
WHERE ${postgres.config.customerIdColumn} = '${sg.customerId}'`;

  return await sg.internalIntegrations.postgres.query(postgres, sql);
}

function mapInternalToCustomerRecords(
  mapping: Record<string, string>,
  internalRecords: Record<string, unknown>[]
): Record<string, unknown>[] {
  return internalRecords.map((internalRecord) => {
    const customerRecord: Record<string, unknown> = {};

    Object.entries(mapping).forEach(([appField, customerField]) => {
      customerRecord[customerField] = internalRecord[appField];
    });

    return customerRecord;
  });
}

async function writeRecordsToCustomerIntegration(
  sg: Supaglue,
  {
    syncConfig,
    sync,
    fieldMapping,
    records,
    syncRunId,
  }: {
    sync: Sync;
    syncConfig: OutboundSyncConfig;
    fieldMapping: Record<string, string>;
    records: Record<string, unknown>[];
    syncRunId: string;
  }
): Promise<void> {
  // Apply mapping
  const customerRecords = mapInternalToCustomerRecords(fieldMapping, records);
  if (!customerRecords.length) {
    throw new Error('No records to write');
  }

  // TODO: Validate / throw error?
  // Apply mapping to upsert key
  const salesforceUpsertKey = fieldMapping[syncConfig.destination.upsertKey];

  const salesforceObject = getSalesforceObject(syncConfig.destination, sync);

  await sg.customerIntegrations.salesforce.upsert(salesforceObject, salesforceUpsertKey, customerRecords);
}

// TODO: This should be generalized. Pending discussion on types / SDK.
function getSalesforceObject(salesforce: SalesforceCustomerIntegration, sync: Sync): string {
  switch (salesforce.objectConfig.type) {
    case 'specified':
      return salesforce.objectConfig.object;
    case 'selectable':
      if (!sync.salesforceObject) {
        // TODO: Make this more generalizable
        throw new Error('Salesforce object requested by SyncConfig but not provided by Sync');
      }
      return sync.salesforceObject;
  }
}
