---
sidebar_position: 2
---

# Setup OAuth

In this section, you'll learn how to use Supaglue to setup and manage OAuth authentication with your customers' Salesforce instances.

## Setup the sample app
For this tutorial, we'll use the included Apolla sample Next.js app for testing. The sample app represents your own application that you're integrating with your customer's Salesforce.

1. Install the sample app:

   ```shell
   cd apps/sample-app
   cp .env.sample .env
   yarn workspaces focus sample-app
   ```

1. Start the sample app locally:

   ```shell
   yarn dev
   ```

1. Open the sample app ([http://localhost:3000](http://localhost:3000)) and login with user: `user1` and password: `password`

   [insert screenshot]

## Create Salesforce OAuth flow
Now that we've setup the sample app, let's use the Supaglue Next.js SDK to setup the Salesforce OAuth flow.

:::info

For this tutorial, the Supaglue Next.js SDK is already installed in the sample app, and configured to talk to the Supaglue API. See [Next.js SDK](/react-components) for more details.

:::

1. Add the following code block in `integrations.tsx` in the sample app:

   ```tsx title=integrations.tsx
   <IntegrationCard
    name="Salesforce"
    description="Sync your Objects"
    configurationUrl={`${location}/salesforce`}
   />
   ```
   This embeds Supaglue's Salesforce connection card, which handles the OAuth connection and redirect Salesforce integration page, using the Salesforce credentials provided in your `.env` file.

2. Save and you should see the connection card appear on the Integrations page in your browser.

   [insert screenshot]

3. Test out this integration by clicking the "Connect" button and entering your Salesforce credentials. Note: these would be your Salesforce developer or sandbox account login credentials.

4. Navigate back to the main Integrations page and you'll notice that the Salesforce connection card has updated.

   [insert screenshot]

## Next steps

Congrats on successfully setting up OAuth authentication. In the next section, we'll define the business logic to sync data from Salesforce to our sample application.