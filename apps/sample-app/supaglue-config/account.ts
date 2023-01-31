import * as sdk from '@supaglue/sdk';
import credentials from './postgres_credentials';

const accountsSchema = sdk.schema({
  fields: [
    {
      name: 'salesforce_id',
      label: 'id',
    },
    {
      name: 'name',
    },
  ],
});
const accountMapping = sdk.defaultFieldMapping(
  [
    { name: 'salesforce_id', field: 'Id' },
    { name: 'name', field: 'Name' },
  ],
  'salesforce'
);

const accountSyncConfig = sdk.salesforce.syncConfig({
  name: 'Accounts',
  salesforceObject: 'Account',
  cronExpression: '*/15 * * * *',
  destination: sdk.destinations.postgres({
    schema: accountsSchema,
    config: {
      credentials,
      table: 'salesforce_accounts',
      upsertKey: 'salesforce_id',
      customerIdColumn: 'customer_id',
    },
  }),
  strategy: 'full_refresh',
  defaultFieldMapping: accountMapping,
});

export default accountSyncConfig;
