---
description: ''
sidebar_position: 4
---

# Notification webhooks

You can configure Supaglue to fire webhooks to your application for important events. These webhooks don't contain Provider data but are used to notify your application or trigger related workflows.

## Use cases

Your integration can listen for these webhooks to do the following:

- Notify customers when initial syncs complete
- Alert on sync errors
- Transform synced data for your application
- Cleanup old data after a customer deletes their account or disconnects their integration
- Backfill data after a customer changes configuration settings
- Clean data after a customer changes [EntityMappings](../platform/entities/overview#entity-mapping)

## Setup

Configure webhook notifications via the Management Portal by navigating to **Settings --> Webhooks**.

![webhook-config](/img/webhooks-tutorial-step-2a.png)

## Event types

- `sync.complete`
- `connection.created`

## Timeout

Webhook events must be processed within 15 seconds.

## More information

You can read our [Listening for Webhooks tutorial](../tutorials/listen-for-webhooks) to go more in-depth on consuming webhook notifications.
