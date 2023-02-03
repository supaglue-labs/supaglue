---
sidebar_position: 3
---

# Deploy integration

In this section, you'll use the Config SDK and the Supaglue CLI to allow your customers to sync Salesforce Contact records from their Salesforce instance into the sample app.

The Config SDK lets you define what to sync and how to sync it using Typescript as configuration, and the CLI helps you deploy it to the Supaglue Integration Service.

## Setup

1. Install the Supaglue CLI:

   ```shell
   npm install -g @supaglue/cli
   ```

## Create Sync Config

In Supaglue, a [Developer Config](/concepts#developer-config) represents a set of Sync Configs. A [Sync Config](/concepts#sync-config) defines how to move one type of Salesforce object from your customers' Salesforce to your application. Once deployed to Supaglue's Integration Service, a Sync Config can be used by your customers as a [Sync](/concepts#sync) via embeddedable [Supaglue React components](/react-components).

:::info

For this tutorial, we've included a sample Developer Config in the `supaglue-config` directory, which lives in the sample app. The Config SDK was also installed as part of the sample app earlier for your convenience.

:::

Let's create a new Sync Config for moving Contacts from your customers' Salesforce to the sample app:

1. Create `supaglue-config/contact.ts` and paste in the following:

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

   The `syncConfig` function creates a Sync Config that would allow customers to pull all Contact records from their Salesforce instance into the sample app's Postgres database every 15 minutes.

1. Now call the `schema` function to create a schema object.

   The schema object exposes the specified Salesforce Contact fields to your customers and lets them map them to fields in the sample app's Postgres database.

   ```tsx title='supaglue-config/contact.ts'
   ...

   const contactSchema = sdk.schema({
     fields: [
       {
         name: 'salesforce_id', // Salesforce Contact field
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

1. Call the `defaultFieldMapping` function to create a defaultFieldMapping object.

   This specifies the default field mapping values for the Salesforce Contact object that would be used in the sample app absent any customer-provided overrides.

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

1. Finally, add the newly created Sync Config for Contacts to the existing Developer Config so it can be deployed with the existing sample Sync Configs:

   ```tsx title='supaglue-config/index.ts'
   import contactSyncConfig from './contact';

   // ...
   syncConfigs: [
    // TUTORIAL: uncomment this
    contactSyncConfig,
    leadSyncConfig,
    opportunitySyncConfig,
    accountSyncConfig
   ],
   // ...
   ```

## Deploy Developer Config

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

## Embed Salesforce OAuth

Let's use the Supaglue Next.js SDK to embed the Salesforce OAuth component.

:::info

The Supaglue Next.js SDK is already installed and set up in the sample app, and configured to talk to the Supaglue API. See [Next.js SDK](/react-components) for more details.

:::

1. Embed Supaglue's `<IntegrationCard/>` into [`integrations.tsx`](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/apps/sample-app/pages/integrations.tsx) in the sample app by uncommenting the code inside of `getIntegrationsCard()`:

   ```tsx title=integrations.tsx:getIntegrationsCard()
   // TUTORIAL: uncomment this
   return (
     <IntegrationCard name="Salesforce" description="Sync your Objects" configurationUrl={`${location}/salesforce`} />
   );
   ```

   This component will handle the OAuth flow between the sample app, Supaglue's Integration Service, and Salesforce using your Salesforce Connected App tokens you provided in `.env` file.

1. Save and you should see the connection card appear on the Integrations page in your browser.

   [insert screenshot]

1. Test out this integration by clicking the "Connect" button and entering Salesforce credentials you use for mocking your customer's Salesforce instance. Note: these could be your Salesforce Developer or sandbox account login credentials.

## Embed Salesforce integration UI

The last step is to embed Supaglue React components in the sample app that customers can use to further configure the integration for their own Salesforce instances.

:::info

The sample app already contains some embedded components, `<FieldMapping/>` and `<TriggerSyncButton/>`, for your reference.

:::

[insert screenshot]

1. Embed [`<Switch/>`](react-components/#switch) into `integrations/[type].tsx` in the sample app by uncommenting the code inside of `getSwitch()`:

   ```tsx title=apps/sample-app/pages/integrations/[type].tsx:getSwitch()
   // return <Switch syncConfigName={syncConfigName} />;
   ```

   This adds a switch that allows a customer to toggle the Contact sync we created on and off.

   [insert screenshot]

## Triggering a Sync Run

Finally, let's test our sync to make sure it works as expected.

1. Click the "Run sync now" button. This triggers Supaglue to execute a [Sync Run](/concepts#sync-run) as a background task.

1. To monitor the status of the Sync Run use the [`syncs list`](/cli#syncs-list) CLI command to check when it completes:

   ```shell
   supaglue syncs list --customer-id user1
   ```

   [add output]

1. Visit the "App Objects" tab to view the synced Contacts records, which is being populated by the Postgres table.

   [insert screenshot]

## Next steps

Congrats on deploying your first Salesforce integration. In the next section, we'll use Supaglue to customize our integration.
