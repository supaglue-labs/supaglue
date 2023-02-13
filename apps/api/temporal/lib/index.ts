import { SalesforceCustomerIntegration, SyncConfig } from '@supaglue/types';
import { Sync } from '../../syncs/entities';

export function getMapping({ fieldMapping }: Sync, syncConfig: SyncConfig): Record<string, string> {
  const schema =
    syncConfig.type === 'inbound' || syncConfig.type === 'realtime_inbound'
      ? syncConfig.destination.schema
      : syncConfig.source.schema;

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

export function mapCustomerToInternalRecords(
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

export function mapInternalToCustomerRecords(
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
export function getSalesforceObject(salesforce: SalesforceCustomerIntegration, sync: Sync): string {
  switch (salesforce.objectConfig.type) {
    case 'specified':
      return salesforce.objectConfig.object;
    case 'selectable': {
      const object =
        sync.type === 'inbound' || sync.type === 'realtime_inbound' ? sync.source?.object : sync.destination?.object;
      if (!object) {
        // TODO: Make this more generalizable
        throw new Error('Salesforce object requested by SyncConfig but not provided by Sync');
      }
      return object;
    }
  }
}
