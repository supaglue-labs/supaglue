---
sidebar_position: 3
---

# Tutorial

In this tutorial, you'll learn to deploy a basic Salesforce integration that syncs Salesforce Contacts, Accounts, Leads, and Opportunities to a sample application called Apolla.io.

You'll learn the basics of the Supaglue SDK and how to customize your integration and the UI components you expose to your end users.

## Begin you begin

To complete this tutorial you will need the following:

- [Developer Salesforce Account](https://developer.salesforce.com/)
- [Salesforce Connected App](integrations/salesforce) set up for the developer Salesforce account

## Install CLI and sample app

We will use the CLI to deploy our syncs and the Apolla.io sample app to test how users can customize and interact with it.

1. Install the [Supaglue CLI](cli):

   ```shell
   npm install -g @supaglue/cli
   ```

1. Install the Apolla.io sample integration app:

   ```shell
   cd apps/sample-app
   cp .env.sample .env
   yarn workspaces focus sample-app
   ```

## Deploy a Sync

### Deploy a Developer Config

1. We've provided a sample Developer Config that sets up four [Syncs](concepts/sync) to sync sObjects from Salesforce, every 15 minutes, into Apolla.io using customer-defined field mappings. Contacts, Leads, and Accounts will be written to Postgres. Opportunities will [call a webhook](https://github.com/supaglue-labs/supaglue/blob/0.1.0/apps/sample-app/pages/api/_sync/index.ts). Take a look at the sample individual [Sync Config](concepts/developer_config#sync-config):

   - Contact ([contact.ts](https://github.com/supaglue-labs/supaglue/blob/0.1.0/apps/sample-app/supaglue-config/contact.ts)),
   - Lead ([lead.ts](https://github.com/supaglue-labs/supaglue/blob/0.1.0/apps/sample-app/supaglue-config/lead.ts)),
   - Opportunity ([opportunity.ts](https://github.com/supaglue-labs/supaglue/blob/0.1.0/apps/sample-app/supaglue-config/opportunity.ts)),
   - Account ([account.ts](https://github.com/supaglue-labs/supaglue/blob/0.1.0/apps/sample-app/supaglue-config/account.ts))

1. Deploy the sample Developer Config for the Apolla.io app using the [`apply`](cli/#commands) CLI command:

   ```shell
   supaglue apply supaglue-config/
   ```

   You should see output like the following:

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

### Embed a Supaglue React component

To enable users to configure the integration we just deployed, embed a user-facing Supaglue React component into the sample app:

1. Start the Apolla.io sample app:

   ```shell
   yarn dev
   ```

1. Add an embeddable [`<Switch/>`](react-components/#switch) React component into `integrations/[type].tsx`. We can use this to toggle continuous syncs on and off on Apolla.io. Uncomment the block of code starting on line 103 of `integrations/[type].tsx` and add the `Switch` import:

   ```typescript
   // apps/sample-app/pages/integrations.tsx
   import { Switch } from '@supaglue/nextjs';

   // ...

   <div className="px-3">
     <div className="py-2">
       <Switch syncConfigName={syncConfigName} />
     </div>
     <p className="text-sm text-gray-600">Incrementally sync all updated contacts every 15 minutes.</p>
   </div>;

   // ...
   ```

### Customer configuration

As a customer, let's connect our Salesforce instance to Apolla.io.

1. Navigate to Apolla.io ([http://localhost:3000](http://localhost:3000)) and login with user: `user1` and password: `password`

2. Under "Integrations", click "Connect" to connect to your Salesforce instance

3. Using the `<FieldMapping/>` component that you embedded above, ensure the fields in your Salesforce object map to Apolla.io's object. It should look like the following:

   | Application field | Salesforce field |
   | ----------------- | ---------------- |
   | id                | Id               |
   | email             | Email            |
   | first name        | FirstName        |

4. Click the "Run sync now" button. This runs the sync as a background task. Let's use the `syncs list` CLI command to check when it completes:

   ```shell
   supaglue syncs list --customer-id user1
   ```

5. Once the sync completes you can visit the "App Objects" tab to view the synced records.

## Customize your integration

Now that we've gone through the entire integration lifecycle, let's add some customizations.

### Customize Developer Config

Let's add two fields, last name and title, to be synced and accessible for our customer to map.

1. Modify the `contactSchema` in `apps/sample-app/supaglue-config/contact.ts`:

   ```typescript
   const contactSchema = sdk.schema({
     fields: [
       // ...
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

1. Re-run the CLI command to apply the latest changes to production:

   ```shell
   supaglue apply supaglue-config
   ```

1. Go to Apolla.io ([http://localhost:3000/integrations](http://localhost:3000/integrations)). You should now see the two newly configured fields:

   | Application field | Salesforce field |
   | ----------------- | ---------------- |
   | id                | Id               |
   | email             | Email            |
   | first name        | FirstName        |
   | last name         | LastName         |
   | title             | Title            |

1. Click "Run sync now".

1. Once the background sync completes, view the newly synced fields under the "App Objects" tab

### Customize React components

Now let's customize the look-and-feel of one of the React components that we embedded in Apolla.io by adding an `appearance` prop into `<FieldMapping/>`.

1. In `apps/sample-app/src/pages/integrations/[type].tsx:109`, add the `appearance` prop below:

   ```jsx
   <FieldMapping
     syncConfigName={syncConfigName}
     key={syncConfigName}
     appearance={{
       elements: {
         form: 'bg-base-300',
         fieldName: 'italic text-sm',
       },
     }}
   />
   ```

2. Visit Apolla.io ([http://localhost:3000/integrations](http://localhost:3000/integrations)). Note how the `<FieldMapping/>` UI now looks different.

## Next Steps

You've successfully shipped your first Salesforce integration using Supaglue, complete with customizations. Congrats!

Learn more about how Supaglue works in the Concepts section.
