---
sidebar_position: 3
---

import BrowserWindow from '@site/src/components/BrowserWindow';

# Tutorial

**In under 15 minutes**, you'll build an integration that allows your customers to sync their Salesforce Account records to a sample Next.js application. We'll use the same sample application from the [Quickstart](./quickstart) for the tutorial.

You'll learn how to use Supaglue's SDKs and CLI to setup and deploy the integration (frontend and backend), and customize the UI you expose to your customers.

<iframe width="640" height="400" src="https://www.loom.com/embed/7f1385c598874448b171a010de325593" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

## Before you begin

Be sure to have completed the [Quickstart](./quickstart).

:::info

For this tutorial, we've provided Salesforce Connected App credentials as part of the Sample App setup. Before deploying to production, please provide your own [Salesforce Connected App](./references/setup_salesforce) credentials.

:::

1. Start the sample app locally if it's not already started:

   ```shell
   cd apps/sample-app
   yarn dev
   ```

1. Open the sample app ([http://localhost:3000](http://localhost:3000)) and login with user: `user1` and password: `password`

## Deploy Developer Config

In Supaglue, a [Developer Config](./concepts#developer-config) represents a set of Sync Configs. A [Sync Config](./concepts#sync-config) defines how to move one type of Salesforce object from your customers' Salesforce to your application. Once deployed to Supaglue's Integration Service, a Sync Config can be used by your customers as a [Sync](./concepts#sync) via embeddedable [Supaglue React components](./react-components).

The Developer Config you deployed in the [Quickstart](./quickstart) currently contains Syncs for Contacts, Leads, and Opportunities. We will now add a Sync for Accounts.

### Create Sync Config for Accounts

To build a Salesforce Sync, we first use the [Config SDK](./config_sdk) to create a Sync Config, which defines how to move Salesforce records between your customers' Salesforce and your application:

:::info

For this tutorial, we've included a sample [Developer Config](./concepts#developer-config) in the `supaglue-config` directory, which lives in the sample app. The Config SDK was also installed as part of the sample app earlier for your convenience.

:::

1. Create `account.ts` inside the `apps/sample-app/supaglue-config/inbound` directory. Paste in the following:

  ```tsx title='apps/sample-app/supaglue-config/inbound/account.ts'
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
  ```

  The `inbound` function creates a Sync Config that would allow customers to pull all Account records from their Salesforce instance into the sample app's Postgres database every 15 minutes.

  The schema object exposes the specified Salesforce Account fields to your customers and lets them map them to fields in the sample app's Postgres database.

  The defaultFieldMapping object specifies the default field mapping values for the Salesforce Account object that would be used in the sample app absent any customer-provided overrides.

1. Finally, add the newly created Sync Config for Accounts to the existing Developer Config so it can be deployed with the existing sample Sync Configs:

   ```tsx title='supaglue-config/index.ts'
   // TUTORIAL: uncomment this
   import accountInboundSyncConfig from './inbound/account';

   // ...
   syncConfigs: [
    contactOutboundSyncConfig,
    contactInboundSyncConfig,
    leadInboundSyncConfig,
    opportunityInboundSyncConfig,
    // TUTORIAL: uncomment this
    accountInboundSyncConfig
   ],
   // ...
   ```

1. Deploy the sample Developer Config using the CLI:

   ```shell
   supaglue apply supaglue-config/
   ```

   You should see the following output:

  ```console
  ...
  ╔══════════════════╤═══════════╤════════╗
  ║ Name             │ Action    │ Status ║
  ╟──────────────────┼───────────┼────────╢
  ║ Contacts         │ No Change │ Live   ║
  ╟──────────────────┼───────────┼────────╢
  ║ Leads            │ No Change │ Live   ║
  ╟──────────────────┼───────────┼────────╢
  ║ Opportunities    │ No Change │ Live   ║
  ╟──────────────────┼───────────┼────────╢
  ║ Accounts         │ Created   │ Live   ║
  ╚══════════════════╧═══════════╧════════╝

  Syncs Created: 1, Updated: 0, Deleted: 0, No Change: 3
  ```

### Test the integration

Finally, let's manually trigger our sync to make sure it works as expected.

1. Navigate to the [accounts sync config tab](http://localhost:3000/integrations/salesforce#Accounts) in the sample app.

1. Click the "Sync Accounts" switch to enable accounts to be synced on a schedule.

1. Click the "Run sync now" button. This triggers Supaglue to execute a [Sync Run](./concepts#sync-run) immediately as a background task.

1. Check the status of the Sync Run by running [`syncs list`](./cli#syncs-list) command to check when it completes:

   ```shell
   supaglue syncs list --customer-id user1
   ```

   You should see that the Accounts sync is enabled from the switch, that it was last run recently and that it's scheduled to run in the future.

   ```supaglue syncs list --customer-id user1
   ℹ Info: Syncs for customer user1
   ╔══════════════════╤═════════╤══════════════════════════╤══════════════════════════╗
   ║ Sync Name        │ Enabled │ Last Run                 │ Next Run                 ║
   ╟──────────────────┼─────────┼──────────────────────────┼──────────────────────────╢
   ║ Contacts         │ No      │ 2023-02-03T06:45:22.937Z │ n/a                      ║
   ╟──────────────────┼─────────┼──────────────────────────┼──────────────────────────╢
   ║ Opportunities    │ No      │ n/a                      │ n/a                      ║
   ╟──────────────────┼─────────┼──────────────────────────┼──────────────────────────╢
   ║ Accounts         │ Yes     │ 2023-02-03T08:08:34.344Z │ 2023-02-03T08:15:00.000Z ║
   ╟──────────────────┼─────────┼──────────────────────────┼──────────────────────────╢
   ║ Leads            │ No      │ n/a                      │ n/a                      ║
   ╚══════════════════╧═════════╧══════════════════════════╧══════════════════════════╝
   ```

1. Visit the "App Objects" tab to view the synced Accounts records, which is being populated by the Postgres table.

   <BrowserWindow url="http://localhost:3000/Accounts">

   ![app_accounts_switch](/img/tutorial/app_filled_accounts.png 'salesforce accounts records')
   </BrowserWindow>

## Customize integration

Supaglue lets you customize the fields and mappings you expose to your customers via React components, as well as the look-and-feel of the UI itself.

### Customize Sync Config

You may have realized that two of the columns in the sample app's Contacts table are missing. Let's add two fields, last name and title, to be synced. These will be available for customers to map.

1. Update the schema object to include the two missing fields:

   ```tsx title=apps/sample-app/supaglue-config/inbound/contact.ts
   const contactSchema = sdk.schema({
     fields: [
       // ...
       // TUTORIAL: Uncomment this
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
   ```

1. Re-run the [`apply`](./cli#apply) CLI command to apply the latest changes:

   ```shell
   supaglue apply supaglue-config/
   ```

1. On the [Salesforce Integration](http://localhost:3000/integrations/salesforce#Contacts) page you should now see two newly configured fields:

   <BrowserWindow url="http://localhost:3000/integrations/salesforce#Contacts">

   ![app_filled_contacts](/img/tutorial/app_contacts_config_card.png 'salesforce contacts records')
   </BrowserWindow>

1. Click "Run sync now". Once the background sync completes, verify the newly synced fields now contain values on the "App Objects" page.

   <BrowserWindow url="http://localhost:3000/#Contacts">

   ![app_filled_contacts](/img/tutorial/app_filled_contacts.png 'salesforce accounts records')
   </BrowserWindow>

### Customize Theme

Suppose you want to implement dark mode on your application.

We can update the Supaglue components to fit a dark app theme by providing the `SupaglueProvider` with a dark theme.

```tsx title=apps/sample-app/pages/_app.tsx
// TUTORIAL: Uncomment this
import { darkTheme } from '@supaglue/nextjs';
// ...
<SupaglueProvider
  customerId={customerId}
  // TUTORIAL: Uncomment this
  theme={darkTheme}
>
```

Now the Supaglue components should reflect the dark theme:

<BrowserWindow url="http://localhost:3000/Integrations">

![integrations_page_dark](/img/tutorial/integrations_page_dark.png 'integrations page dark mode')
</BrowserWindow>

## Next Steps

Congrats! You've successfully shipped your first Salesforce integration using Supaglue, complete with customizations. Learn more about how Supaglue works in the Concepts section.
