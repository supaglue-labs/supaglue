---
sidebar_position: 2
---

# Quickstart

**In less than 5 minutes**, you will use Supaglue to deploy a basic Salesforce integration that allows your customers to sync their Salesforce objects to a sample Next.js application.

## Clone and start Supaglue

```shell
# Clone our repo
git clone git@github.com:supaglue-labs/supaglue.git && cd supaglue

# Create an encryption secret for credentials
echo "SUPAGLUE_API_ENCRYPTION_SECRET=$(openssl rand -base64 32)" >> .env

# Start the Supaglue stack
docker compose up
```

## Install sample app

We've provided a [sample Next.js app](https://github.com/supaglue-labs/supaglue/blob/v0.1.1-1/apps/sample-app/). The sample app represents your own application where you would like your customers to connect their Salesforce instance.

In this step, we will set up the sample application.

1. Open a new terminal window and install the sample app (note: we've bundled it into our monorepo):

   NOTE: for your convenience, [setup_env.sh](https://github.com/supaglue-labs/supaglue/blob/v0.1.1-1/apps/sample-app/scripts/setup_env.sh) helps you get started quickly by using our Salesforce Connected App credentials. You can also [set up](/references/setup_salesforce) or use your own Connected App credentials by changing the credentials in `.env`.

   ```shell
   cd apps/sample-app
   ./scripts/setup_env.sh
   yarn workspaces focus sample-app
   npm install -g @supaglue/cli
   ```

1. Start the sample app locally:

   ```shell
   yarn dev
   ```

The sample app can be accessed at ([http://localhost:3000](http://localhost:3000)) and by logging in as a mock customer with username: `user1` and password: `password`. You should see the following empty table, indicating no Salesforce records have yet synced to the sample app.

import BrowserWindow from '@site/src/components/BrowserWindow';

<BrowserWindow url="http://localhost:3000">

![empty_records](/img/quickstart/app_empty_records.png 'empty records sample app')
</BrowserWindow>

## Deploy Supaglue config

In this step, we will deploy Supaglue configuration to enable customers (i.e. `user1` from the previous step) to sync Salesforce Contacts, Leads, and Opportunities

1. Open a new tab and deploy the sample Developer Config using the CLI:

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
   ╚═══════════════╧═════════╧════════╝

   Syncs Created: 3, Updated: 0, Deleted: 0, No Change: 0
   ```

1. Navigate to the [Integrations page](http://localhost:3000/integrations). You should now see a card that allows you to connect your Salesforce instance.

   <BrowserWindow url="http://localhost:3000/integrations">

   ![integration_card](/img/quickstart/app_salesforce_connect_card.png 'integration_card sample app')
   </BrowserWindow>

1. Click the "Connect" button and enter your Salesforce credentials to go through the OAuth flow. Note: these could be your Salesforce Developer or sandbox account login credentials.

   Upon successful login, you will be redirected to the [Salesforce Integrations page](http://localhost:3000/integrations/salesforce) .

   <BrowserWindow url="http://localhost:3000/integrations/salesforce">

   ![salesforce_config](/img/quickstart/app_salesforce_config.png 'salesforce config sample app')
   </BrowserWindow>

## Run a Salesforce sync

1. Click the "Run sync now" button to trigger an inbound sync from your Salesforce into the sample app.

1. Navigate to the [App Objects](http://localhost:3000/) page and you will now see contacts from your Salesforce instance in a table! (You may have to refresh a few times if you navigated to this page before the sync has completed.)

   <BrowserWindow url="http://localhost:3000/integrations">

   ![filled_records](/img/quickstart/app_filled_records.png 'filled records sample app')
   </BrowserWindow>
