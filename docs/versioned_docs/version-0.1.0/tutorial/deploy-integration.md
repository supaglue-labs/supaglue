---
sidebar_position: 3
---

# Deploy integration

In this section, you'll learn to use the Config SDK and the Supaglue CLI to sync Salesforce Contact records from your customer's Salesforce instance into our sample application.

The Config SDK lets you define your configuration in Typescript, and the CLI helps you deploy your configuration to the Supaglue Integration Service.

## Setup

1. Install the Supaglue CLI:

   ```shell
   npm install -g @supaglue/cli
   ```

:::info

For this tutorial, we've included sample configuration in the `supaglue-config` directory, which lives in the sample app. The Config SDK is already installed.

:::

## Create sync

In Supaglue, a sync represents a deployed Sync Config that is exposed to end users via embedded UI components. Let's create one for syncing Contacts from Salesforce to our sample application:

1. Create `supaglue-config/contact.ts` and paste in the following Supaglue configuration.

   The `syncConfig` object defines a sync that pulls all Contact records from the customer's Salesforce instance into our sample application's Postgres database every 15 minutes.

   ```tsx title='supaglue-config/contact.ts'
   import * as sdk from '@supaglue/sdk';
   import credentials from './postgres_credentials';

   const contactSyncConfig = sdk.salesforce.syncConfig({
     name: 'Contacts',
     salesforceObject: 'Contact',
     cronExpression: '*/15 * * * *',
     destination: sdk.destinations.postgres({
       schema: contactSchema,
       config: {
         credentials,
         table: 'salesforce_contacts',
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

   export default contactSyncConfig;

   ```

1. Now add the `schema` object.

   The schema object exposes certain Contact fields to the customer and maps them to fields in our Postgres database.

   ```tsx title='supaglue-config/contact.ts'
   ...

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
       {
         name: 'last_name',
         label: 'last name',
       },
       {
         name: 'title',
         label: 'title',
       },
     ],
   });

   ...
   ```

1. Finally, add the `defaultFieldMapping` object.

   This specifies the default field mapping values for the Contact object that would be used absent any end user overrides.

   ```tsx title='supaglue-config/contact.ts'
   ...

   const contactMapping = sdk.defaultFieldMapping(
     [
       { name: 'salesforce_id', field: 'Id' },
       { name: 'email', field: 'Email' },
       { name: 'first_name', field: 'FirstName' },
       { name: 'last_name', field: 'LastName' },
       { name: 'title', field: 'Title' },
     ],
     'salesforce'
   );
   ...
   ```

1. Deploy the sample Developer Config using the CLI:

   ```shell
   supaglue apply supaglue-config/
   ```

   You should see the following output:

   ```console
   ...
   ╔═══════════════╤═════════╤════════╗
   ║ Name          │ Action  │ Status ║
   ╟───────────────┼─────────┼────────╢
   ║ Contacts      │ Created │ Live   ║
   ╟───────────────┼─────────┼────────╢
   ║ Leads         │ Created │ Live   ║
   ╟───────────────┼─────────┼────────╢
   ║ Opportunities │ Created │ Live   ║
   ╟───────────────┼─────────┼────────╢
   ║ Accounts      │ Created │ Live   ║
   ╚═══════════════╧═════════╧════════╝

   Syncs Created: 4, Updated: 0, Deleted: 0, No Change: 0
   ```

## Build Salesforce integration UI

Now that we've created and deployed our sync configuration, the last step is to embed Supaglue UI components in our sample application that customers can use to further configure the integration for their own Salesforce instances.

:::info

The sample app already contained an embedded mapping UI (populated with our default field values) and manual "sync now" UI components for your reference.

:::

   [insert screenshot]

1. Uncomment the block of code starting on line 103 of integrations/[type].tsx and add the [`<Switch/>`](react-components/#switch) import:

   ```tsx title=apps/sample-app/pages/integrations/[type].tsx
   import { Switch } from '@supaglue/nextjs';

   // ...

   <div className="px-3">
      <div className="py-2"><Switch syncConfigName={syncConfigName} /></div>
      <p className="text-sm text-gray-600">Fully refresh all updated contacts every 15 minutes.</p>
   </div>

   // ...
   ```

   This adds a switch that allows a customer to toggle the Contact sync we created on and off.

   [insert screenshot]

## Triggering a Sync

Finally, let's test our sync to make sure it works as expected.

1. Click the "Run sync now" button. This triggers Supaglue to run the sync as a background task.

2. Run the `syncs list` CLI command to check the status when it completes:

   ```shell
   supaglue syncs list --customer-id user1
   ```

   [add output]

3. Visit the "App Objects" tab to view the synced Contacts records, which is being populated by the Postgres table.

   [insert screenshot]

## Next steps

Congrats on deploying your first Salesforce integration. In the next section, we'll use Supaglue to customize our integration.