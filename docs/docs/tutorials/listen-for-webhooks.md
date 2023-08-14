import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# Listen for webhooks

![platform](https://img.shields.io/badge/Platform%20Tutorial-009be5)

This tutorial will show how to subscribe to Supaglue notification webhooks and process them using best practices to build a robust integration with the platform.

<ThemedImage
alt="webhook tutorial diagram 1"
width="75%"
sources={{
    light: '/img/webhook-tutorial-diagram-1.png',
    dark: '/img/webhook-tutorial-diagram-1.png',
  }}
/>

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../quickstart) and will use the following technologies:

- Nodejs+Expressjs
- Typescript
- HTTP

## Overview

Supaglue notification webhooks are HTTP requests that Supaglue sends to your API endpoint to notify you of important events like syncs completing, errors occurring, and more. At a high level, the process to listen for webhooks looks like the following:

1. Define an API endpoint to process webhook events
2. Subscribe to the webhook events
3. Process the webhook events

### Use Cases

Your integration can listen for these webhooks to do the following:

- Alert on sync errors
- Transform synced data for your application
- Cleanup old data after a customer deletes their account or disconnects their integration
- Backfill data after a customer changes configuration settings
- Clean data after a customer changes [EntityMappings](../platform/entities/overview#entity-mapping)

## Setup

### 1. Define an API endpoint to process events

At their core, they are just a `POST` request to a pre-determined endpoint. The endpoint can be whatever you want, and you can just add them from the Management Portal. You normally use one endpoint that listens to all of the event types. For example, if you receive webhooks from Acme Inc., you can structure your URL like: `https://www.example.com/webhooks/`.

The way to indicate that a webhook has been processed is by returning a `2xx` (status code `200-299`) response to the webhook message within a reasonable time frame (**15s\*\***). It's also important to disable `CSRF` protection for this endpoint if the framework you use enables them by default.

Below is an example using Typescript, Nodejs+Expressjs:

```ts
import express from 'express';

const app = express();

app.get('/webhooks', async (req: Request, res: Response) {
    // Do stuff here...

    return res.status(200).send();
})

app.listen(8080);

```

Another important aspect of handling webhooks is to verify the signature and timestamp when processing them. You can learn more about it in the [webhook security](#webhook-security) section.

### 2. Subscribe to the webhook events

Navigate to **Settings --> Webhooks** in the Management Portal and enter the URL of your API from Step 1.

<ThemedImage
alt="webhook tutorial step 2a"
width="75%"
sources={{
    light: '/img/webhooks-tutorial-step-2a.png',
    dark: '/img/webhooks-tutorial-step-2a.png',
  }}
/>

Click on the events that are important to you. Supaglue emits notification webhooks for the [following events](../platform/notification-webhooks).

<ThemedImage
alt="webhook tutorial step 2b"
width="75%"
sources={{
    light: '/img/webhooks-tutorial-step-2b.png',
    dark: '/img/webhooks-tutorial-step-2b.png',
  }}
/>

In the example above, `connection.create` and `sync.complete` are selected.

### 3. Process the webhook events

You can process webhooks synchronously or asynchronously. If you are testing or building out a proof-of-concept, synchronous processing is fine. For production-grade integrations, asynchronous processing is recommended.

#### Synchronous processing

Processing webhook events synchronously means that you run business logic before returning a `2xx` to Supaglue. This is fast to implement and doesn't require additional infrastructure, but runs into problems in failure scenarios, or when your processing time begins to exceed the 15s timeout, which then causes back pressure issues.

#### Asynchronous processing (recommended)

In a production setting where you need to scale the consumption of webhooks, it is recommended that you enqueue the webhook events into an internal queue for later processing.

<ThemedImage
alt="webhook tutorial diagram 2"
width="100%"
sources={{
    light: '/img/webhook-tutorial-diagram-2.png',
    dark: '/img/webhook-tutorial-diagram-2.png',
  }}
/>

The sequence for processing webhook events asynchronously is the following:

1. Supaglue fires a webhook event
2. You enqueue it successfully to an internal queue
3. You respond with a 200 to Supaglue
4. You dequeue from your internal queue and process the events

Below is an example of Steps 1-3 using Typescript, Nodejs+Expressjs, [BullMQ](https://github.com/taskforcesh/bullmq):

```ts
import express from 'express';
import { Queue } from 'bullmq';

const supaglueEventsQueue = new Queue('supaglueEventsQueue');
const app = express();

app.get('/webhooks', async (req: Request, res: Response) {
    const eventType = req.headers.get('x-event-type');

    supaglueEventsQueue.add(eventType, { data: JSON.stringify(req.body) })

    return res.status(200).send();
})

app.listen(8080);

```

Several popular queue or message broker technologies include the following:

- Kafka/Confluent
- Redis
- RabbitMQ
- Celery
- AWS SQS
- GCP Cloud Tasks
- GCP PubSub
- ...

## Webhook security

Because of the way webhooks work, attackers can impersonate services by simply sending a fake webhook to an endpoint. Think about it: it's just an HTTP POST from an unknown source. This is a potential security hole for many applications, or at the very least, a source of problems.

To prevent it, Supaglue signs every webhook and its metadata with a unique key for each endpoint. This signature can then be used to verify the webhook indeed comes from Supaglue, and only process it if it is.

Another potential security hole is what's called replay attacks. A [replay attack](https://en.wikipedia.org/wiki/Replay_attack) is when an attacker intercepts a valid payload (including the signature), and re-transmits it to your endpoint. This payload will pass signature validation, and will therefore be acted upon.

To mitigate this attack, Supaglue includes a timestamp for when the webhook attempt occurred. Our libraries automatically reject webhooks with a timestamp that are more than five minutes away (past or future) from the current time. This requires your server's clock to be synchronised and accurate, and it's recommended that you use [NTP](https://en.wikipedia.org/wiki/Network_Time_Protocol) to achieve this.

Supaglue uses an underlying webhook framework called Svix. Look more about how to validate the signature of webhook events in their [docs here](https://docs.svix.com/receiving/verifying-payloads/how).
