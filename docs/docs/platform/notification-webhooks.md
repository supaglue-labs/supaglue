---
description: ''
sidebar_position: 4
---

# Notification webhooks

You can configure Supaglue to fire webhooks to your application when certain system events occur. These webhooks don't contain provider data, but rather are intended to help notify your application or trigger related application workflows.

For example, you can configure a webhook to fire when new connections are created or when managed syncs finish. Some of the things you can do with webhooks include:

* Notify customers when initial syncs complete
* Display appropriate UI upon connection success or failure
* Trigger data transformation workflows are new data syncs to your database

These webhooks can be configured via the management portal, or via the [management API](../api/v2/mgmt/webhooks).

![webhook-config](/img/webhook_config.png)
