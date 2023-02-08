import * as sdk from '@supaglue/sdk';

const opportunitiesSchema = sdk.schema({
  fields: [
    {
      name: 'salesforce_id',
      label: 'id',
    },
    {
      name: 'name',
    },
    {
      name: 'salesforce_account_id',
      label: 'accountId',
    },
    {
      name: 'close_date',
      label: 'closeDate',
    },
    {
      name: 'stage',
    },
  ],
});

const opportunityMapping = sdk.defaultFieldMapping([
  { name: 'salesforce_id', field: 'Id' },
  { name: 'name', field: 'Name' },
  { name: 'salesforce_account_id', field: 'AccountId' },
  { name: 'close_date', field: 'CloseDate' },
  { name: 'stage', field: 'StageName' },
]);

const opportunitySyncConfig = sdk.salesforce.inboundSyncConfig({
  name: 'Opportunities',
  salesforceObject: 'Opportunity',
  cronExpression: '*/15 * * * *',
  destination: sdk.destinations.webhook({
    schema: opportunitiesSchema,
    config: {
      url: 'http://host.docker.internal:3000/api/_sync',
      requestType: 'POST',
    },
  }),
  strategy: 'full_refresh',
  defaultFieldMapping: opportunityMapping,
});

export default opportunitySyncConfig;
