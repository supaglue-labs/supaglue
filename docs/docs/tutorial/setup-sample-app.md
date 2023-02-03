---
sidebar_position: 2
---

# Setup sample app

In this first section, you'll set up a sample app.

## Install

We've provided a [sample Next.js app](https://github.com/supaglue-labs/supaglue/blob/v0.1.0/apps/sample-app/), called Apolla, for this tutorial. The sample app represents your own application that you're building a Salesforce integration with, for your customers to connect their Salesforce instance.

1. Install the sample app (note: we've bundled it into our monorepo):

   ```shell
   cd apps/sample-app
   cp .env.sample .env
   yarn workspaces focus sample-app
   ```

1. Replace the `SALESFORCE_KEY` and `SALESFORCE_SECRET` values in `.env` using your Developer Salesforce Account's Connected App tokens. (Reminder, you can follow [these steps](/tutorial/overview#before-you-begin) from the Overview section to obtain them.)

1. Start the sample app locally:

   ```shell
   yarn dev
   ```

1. Open the sample app ([http://localhost:3000](http://localhost:3000)) and login with user: `user1` and password: `password`

   [insert screenshot]

## Next steps

In the next section, we'll define the business logic to sync data from your customers' Salesforce to the sample app.
