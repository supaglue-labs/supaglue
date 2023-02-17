import * as sdk from '@supaglue/sdk';
import { contactMapping } from '../common/contact';
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
  ],
});

const contactSyncConfig = sdk.syncConfigs.outbound({
  name: 'ContactsOutbound',
  destination: sdk.customer.destinations.salesforce({
    objectConfig: sdk.customer.common.salesforce.specifiedObjectConfig('Contact'),
    upsertKey: 'salesforce_id',
  }),
  cronExpression: '*/15 * * * *',
  source: sdk.internal.sources.postgres({
    schema: contactSchema,
    config: {
      credentials,
      table: 'salesforce_contacts',
      customerIdColumn: 'customer_id',
      customPropertiesColumn: 'extra_attributes',
    },
    retryPolicy: sdk.retryPolicy({
      retries: 2,
    }),
  }),
  strategy: 'full_refresh',
  defaultFieldMapping: contactMapping,
  customPropertiesEnabled: true,
});

export default contactSyncConfig;
