import * as sdk from '@supaglue/sdk';
import credentials from './postgres_credentials';

const leadsSchema = sdk.schema({
  fields: [
    {
      name: 'salesforce_id',
      label: 'id',
    },
    {
      name: 'first_name',
      label: 'first name',
    },
    {
      name: 'last_name',
      label: 'last name',
    },
    {
      name: 'company',
    },
    { name: 'status' },
  ],
});
const leadMapping = sdk.defaultFieldMapping(
  [
    { name: 'salesforce_id', field: 'Id' },
    { name: 'company', field: 'Company' },
    { name: 'status', field: 'Status' },
    { name: 'first_name', field: 'FirstName' },
    { name: 'last_name', field: 'LastName' },
  ],
  'salesforce'
);

const leadSyncConfig = sdk.salesforce.syncConfig({
  name: 'Leads',
  salesforceObject: 'Lead',
  cronExpression: '*/15 * * * *',
  destination: sdk.destinations.postgres({
    schema: leadsSchema,
    config: {
      credentials,
      table: 'salesforce_leads',
      upsertKey: 'salesforce_id',
      customerIdColumn: 'customer_id',
    },
  }),
  strategy: 'full_refresh',
  defaultFieldMapping: leadMapping,
});

export default leadSyncConfig;
