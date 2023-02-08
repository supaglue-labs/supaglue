import * as sdk from '@supaglue/sdk';
import credentials from '../postgres_credentials';

const contactSchema = sdk.schema({
  fields: [
    {
      name: 'salesforce_id',
      label: 'id',
    },
    {
      name: 'email',
    },
    {
      name: 'first_name',
      label: 'first name',
    },
    // TUTORIAL: Uncomment this
    // {
    //   name: 'last_name',
    //   label: 'last name',
    // },
    // {
    //   name: 'title',
    //   label: 'title',
    // },
  ],
});

const contactMapping = sdk.defaultFieldMapping([
  { name: 'salesforce_id', field: 'Id' },
  { name: 'email', field: 'Email' },
  { name: 'first_name', field: 'FirstName' },
  { name: 'last_name', field: 'LastName' },
  { name: 'title', field: 'Title' },
]);

const contactSyncConfig = sdk.salesforce.outboundSyncConfig({
  name: 'ContactsOutbound',
  salesforceObject: 'Contact',
  cronExpression: '*/15 * * * *',
  source: sdk.sources.postgres({
    schema: contactSchema,
    config: {
      credentials,
      table: 'salesforce_contacts',
      customerIdColumn: 'customer_id',
    },
    retryPolicy: sdk.retryPolicy({
      retries: 2,
    }),
  }),
  strategy: 'full_refresh',
  defaultFieldMapping: contactMapping,
  salesforceUpsertKey: 'salesforce_id', // TODO
});

export default contactSyncConfig;
