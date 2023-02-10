import * as sdk from '@supaglue/sdk';
import credentials from '../postgres_credentials';

const accountsSchema = sdk.schema({
  fields: [
    {
      name: 'salesforce_id',
      label: 'id',
    },
    {
      name: 'name',
      label: 'name',
    },
  ],
});

const defaultFieldMapping = sdk.defaultFieldMapping([
  { name: 'salesforce_id', field: 'Id' },
  { name: 'name', field: 'Name' },
]);

const accountSyncConfig = sdk.syncConfigs.inbound({
  name: 'Accounts',
  source: sdk.customer.sources.salesforce({
    objectConfig: sdk.customer.common.salesforce.specifiedObjectConfig('Account'),
  }),
  cronExpression: '*/15 * * * *',
  destination: sdk.internal.destinations.postgres({
    schema: accountsSchema,
    config: {
      credentials,
      table: 'salesforce_accounts',
      upsertKey: 'salesforce_id',
      customerIdColumn: 'customer_id',
    },
  }),
  strategy: 'full_refresh',
  defaultFieldMapping,
});

export default accountSyncConfig;
