import * as sdk from '@supaglue/sdk';
import { contactMapping } from '../common/contact';
import credentials from '../postgres_credentials';

export const emailMessageMapping = sdk.defaultFieldMapping([
  { name: 'salesforce_id', field: 'Id' },
  { name: 'object', field: 'Object' },
]);

const objectSchema = sdk.schema({
  fields: [
    {
      name: 'salesforce_id',
      label: 'id',
    },
    {
      name: 'email',
      // TODO: need a way to specify to map this to object jsonb
    },
    {
      name: 'first_name',
      label: 'first name',
      // TODO: need a way to specify to map this to object jsonb
    },
  ],
});

const objectSyncConfig = sdk.salesforce.inboundSyncConfig({
  name: 'Objects',
  salesforceObject: 'EmailMessage',
  cronExpression: '*/15 * * * *',
  destination: sdk.destinations.postgres({
    schema: objectSchema,
    config: {
      credentials,
      table: 'salesforce_objects',
      upsertKey: 'salesforce_id',
      customerIdColumn: 'customer_id',
    },
    retryPolicy: sdk.retryPolicy({
      retries: 2,
    }),
  }),
  strategy: 'full_refresh',
  defaultFieldMapping: contactMapping,
});

export default objectSyncConfig;
