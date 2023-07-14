---
description: ''
---

# MongoDB

## Overview

:::info
Supaglue currently only supports MongoDB Atlas.
:::

| Feature                              | Available |
| ------------------------------------ | --------- |
| Syncs: Full refresh                  | Yes       |
| Syncs: Incremental refresh           | Yes       |
| Syncs: Supports incremental deletes  | Yes       |
| Cache invalidation on write          | Yes       |
| Common objects (unified by Supaglue) | Yes       |
| Standard objects (per provider)      | Yes       |
| Custom objects (per provider)        | Yes       |

## Setup

:::info
Supaglue currently only supports username/password authentication, not X.509.
:::

:::info
Note that the MongoDB user will need write access to the database you choose.
:::

1. Go to Configuration -> Destinations.
2. Click the Configure button on the MongoDB card.
3. Enter your MongoDB credentials.


![mongodb-config](/img/mongodb_form.png)

## Query patterns

Here are a few high-level best practices when working with collections that Supaglue land:

- It's OK to add indexes. Just be aware of the upkeep costs

## Schema Evolution

Supaglue may evolve the destination table schemas from time to time. To evolve schemas, drop your destination collections, and Supaglue will recreate the collections with the new schemas. Please reach out to ([support@supaglue.com](mailto:support@supaglue.com)) if you need support for backward-compatible strategies.

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
