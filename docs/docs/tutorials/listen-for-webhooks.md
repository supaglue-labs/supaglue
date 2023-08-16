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

The way to indicate that a webhook has been processed is by returning a `2xx` (status code `200-299`) response to the webhook message within a reasonable time frame (**15 seconds**). It's also important to disable `CSRF` protection for this endpoint if the framework you use enables them by default.

Below is an example using Typescript, Nodejs+Expressjs:

```ts
import express from 'express';

const app = express();

app.post('/webhooks', async (req: Request, res: Response) {
    // Do stuff here...

    return res.status(200).send();
})

app.listen(8080);

```

Another important aspect of handling webhooks is to verify the signature and timestamp when processing them. You can learn more about it in the [webhook security](../platform/notification-webhooks#webhook-security) section.

### 2. Subscribe to the webhook events

Navigate to **Settings --> Webhooks** in the Management Portal and enter your API URL from Step 1.

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

In the example above, `connection.created` and `sync.complete` are selected.

### 3. Process the webhook events

You can process webhooks synchronously or asynchronously. Synchronous processing is fine if you are testing or building out a proof-of-concept. We recommend asynchronous processing for production-grade integrations.

#### Synchronous processing

Processing webhook events synchronously means running business logic before returning a `2xx` to Supaglue. Synchronous processing is fast to implement and doesn't require additional infrastructure, but it runs into back pressure and correctness problems if there are errors or times out.

#### Asynchronous processing (recommended)

In a production setting, we recommended adding webhook events into an internal queue for later processing.

<ThemedImage
alt="webhook tutorial diagram 2"
width="100%"
sources={{
    light: '/img/webhook-tutorial-diagram-2.png',
    dark: '/img/webhook-tutorial-diagram-2.png',
  }}
/>

The sequence for processing webhook events asynchronously looks like the following:

1. Supaglue fires a webhook event
2. You enqueue it to an internal queue
3. You respond with a 200 to Supaglue
4. You dequeue from your internal queue and process the events

Below is an example of Steps 1-3 using Typescript, Nodejs+Expressjs, [BullMQ](https://github.com/taskforcesh/bullmq):

```ts
import express from 'express';
import { Queue } from 'bullmq';

const supaglueEventsQueue = new Queue('supaglueEventsQueue');
const app = express();

app.post('/webhooks', async (req: Request, res: Response) {
    const supaglueEvent = JSON.parse(req.body);

    supaglueEventsQueue.add(supaglueEvent.webhook_event_type, { data: req.body })

    return res.status(200).send();
})

app.listen(8080);

```

The shape of the `sync.complete` event looks like the following:

```json
{
  "webhook_event_type": "sync.complete",
  "connection_id": "e30cbb93-5b05-4186-b6de-1acc10013795",
  "customer_id": "7bfcc74d-c98b-49de-8e8f-3dc7a17273f6",
  "provider_name": "hubspot",
  "history_id": "2fdbd03d-11f2-4e66-a5e6-2b731c71a12d",
  "result": "SUCCESS",
  "num_records_synced": 100,
  "error_message": "Error message",
  "type": "object",
  "object_type": "common",
  "object": "contact"
}
```

You can view the complete list of webhook events in our [Management Portal API Reference](../api/v2/mgmt/management-api)

Several popular queue or message broker technologies include the following:

- Kafka/Confluent
- Redis
- RabbitMQ
- Celery
- AWS SQS
- GCP Cloud Tasks
- GCP PubSub
- ...
