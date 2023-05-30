---
description: ''
---

# Syncing data to your app

We recommending syncing data from Supaglue into your application using a [webhook](#1-create-an-http-endpoint-that-will-be-called-by-a-supaglue-webhook)
.

## Syncing via webhook

![sync-data](/img/etl.png)

### 1. Create an HTTP endpoint that will be called by a Supaglue webhook

This endpoint will be called when Supaglue finishes its sync.

For each object type that you wish to sync, call the list endpoints utilizing the `modified_after` timestamp filter to incrementally fetch records.

Start by setting `modified_after` to be the beginning of time (Epoch 0) to initially do a full refresh.

For each page of records returned, write these records to your application database, and fetch the next page of records and repeat.

You should store `modified_after` in your application so that the next time a Supaglue sync finishes you can only fetch and write new changes.

#### Example
View a [full example here](https://github.com/supaglue-labs/ts-etl-example) utilizing Nodejs, Typescript, Express, and Prisma.

- index.ts: [Webhook endpoint](https://github.com/supaglue-labs/ts-etl-example/blob/main/index.ts#L10)
- index.ts: [Concurrently fetch object lists](https://github.com/supaglue-labs/ts-etl-example/blob/main/index.ts#L25)
- supaglue.ts: [Fetch and write a page](https://github.com/supaglue-labs/ts-etl-example/blob/main/lib/supaglue.ts#L42)
- supaglue.ts: [Update watermark when a page is written](https://github.com/supaglue-labs/ts-etl-example/blob/main/lib/supaglue.ts#L95)
- supaglue:ts: [Paginate until done](https://github.com/supaglue-labs/ts-etl-example/blob/main/lib/supaglue.ts#L99)

### 2. Register the webhook with Supaglue

Use the [Management API's POST Webhook endpoint](../references/api/mgmt#tag/Webhook/operation/createWebhook) to register the endpoint implemented above.

You can also use the [Postman webhook reference call](https://www.postman.com/supaglue/workspace/supaglue-public/request/18172762-f62a5612-c293-44c5-bb82-3f7b6c26aeb7) to create the webhook.

## Syncing via cron/polling

Instead of using a webhook to trigger your sync, you can instead use a cron or schedule based poll, utilizing the same incremental fetch and write logic above.
