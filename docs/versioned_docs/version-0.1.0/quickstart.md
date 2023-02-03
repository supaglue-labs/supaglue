---
sidebar_position: 2
---

# Quickstart

In less than 5 minutes, you will use Supaglue to deploy a basic Salesforce integration that allows your customers to sync their Salesforce objects to a sample Next.js application
called Apolla.io.

## Clone and start Supaglue

```shell
# Clone our repo
git clone git@github.com:supaglue-labs/supaglue.git && cd supaglue

# Start the Supaglue stack
docker compose up
```

## Install sample app

We've provided a [sample Next.js app](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/apps/sample-app/), called Apolla. The sample app represents your own application where you would like your customers to connect their Salesforce instance.

In this step, we will set up the sample application.

// TODO: Replace with script that also fetches SF creds

1. Open a new terminal window and install the sample app (note: we've bundled it into our monorepo):

   ```shell
   cd apps/sample-app
   cp .env.sample .env
   yarn workspaces focus sample-app
   npm install -g @supaglue/cli
   ```

1. Start the sample app locally:

   ```shell
   yarn dev
   ```

The sample app can be accessed at ([http://localhost:3000](http://localhost:3000)) and by logging in as a mock customer with username: `user1` and password: `password`.

At this point, because there are no Supaglue configs deployed, customers cannot yet access their Salesforce integrations.

## Deploy Supaglue config

In this step, we will deploy Supaglue configuration to enable customers (i.e. `user1` from the previous step) to sync Salesforce Contacts, Leads, and Opportunities into Apolla.io.

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

1. Navigate to the ([integrations page](http://localhost:3000/integrations)). You should now see a card that allows you to connect your Salesforce instance.

1. Click the "Connect" button and enter your Salesforce credentials. Note: these could be your Salesforce Developer or sandbox account login credentials.

## Run a Salesforce sync

In this step, we will sync Salesforce contacts into the sample application.

1. Click the "Configure" button to enter the configuration page for your syncs.

2. Click the "Run sync now" button to trigger an inbound sync from your Salesforce into the sample app.

3. Navigate to the ([App Objects](http://localhost:3000/)) page and you will now see contacts from your Salesforce instance in a table! (You may have to refresh if you navigated to this page before the sync has completed.)
