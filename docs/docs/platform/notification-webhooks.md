---
description: ''
sidebar_position: 4
---

# Notification webhooks

You can configure Supaglue to fire webhooks to your application for important events. These webhooks don't contain Provider data but are used to notify your application or trigger related workflows.

Supaglue uses [Svix](https://svix.com) as its webhooks platform. They provide some nice characteristics for building production-grade webhooks in the following areas:

- [idempotency](https://docs.svix.com/idempotency): exactly-once semantics
- [rate limiting](https://docs.svix.com/rate-limit): 1000 QPS (user configurable)
- [retries](https://docs.svix.com/retries): exponential backoff
- [retention](https://docs.svix.com/retention): 90 days
- [security](https://docs.svix.com/security)

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

## Webhook security

Because of the way webhooks work, attackers can impersonate services by simply sending a fake webhook to an endpoint. Think about it: it's just an HTTP POST from an unknown source. This is a potential security hole for many applications, or at the very least, a source of problems.

To prevent it, Supaglue signs every webhook and its metadata with a unique key for each endpoint. This signature can then be used to verify the webhook indeed comes from Supaglue, and only process it if it is.

Another potential security hole is what's called replay attacks. A [replay attack](https://en.wikipedia.org/wiki/Replay_attack) is when an attacker intercepts a valid payload (including the signature), and re-transmits it to your endpoint. This payload will pass signature validation, and will therefore be acted upon.

To mitigate this attack, Supaglue includes a timestamp for when the webhook attempt occurred. Our libraries automatically reject webhooks with a timestamp that are more than five minutes away (past or future) from the current time. This requires your server's clock to be synchronised and accurate, and it's recommended that you use [NTP](https://en.wikipedia.org/wiki/Network_Time_Protocol) to achieve this.

Supaglue uses an underlying webhook framework called Svix. Look more about how to validate the signature of webhook events in their [docs here](https://docs.svix.com/receiving/verifying-payloads/how).

## More information

You can read our [Listening for Webhooks tutorial](../tutorials/listen-for-webhooks) to go more in-depth on consuming webhook notifications.
