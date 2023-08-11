---
description: ''
---

# MySQL

## Overview

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

1. Go to Configuration -> Destinations.
2. Click the Configure button on the MySQL card.
3. Enter your MySQL credentials.

:::info
Note that the mysql user will need write access to the schema/database you choose.
:::

## Data isolation

Supaglue lands tables into your MySQL. You can configure Supaglue to write to a separate physical/logical database or schema (see diagram below) by creating a user/role for Supaglue (see [Setup](./mysql.md#Setup)).

## Query patterns

Here are a few high-level best practices when working with tables that Supaglue land:

- Avoid adding database constraints
- Avoid altering the schema of the existing columns
- Minimize adding columns to the tables
- It's OK to add indexes. Just be aware of the upkeep costs

There are a few patterns (from simplest to more complex) for querying tables that Supaglue writes into your MySQL:

### Pattern #1 - Direct Query

The simplest way to query data is to directly query the tables that Supaglue lands. This is well-suited for simple queries. You may optionally add indexes to help query performance.

### Pattern #2 - Logical view

If you need to transform the data that Supaglue lands, you can create MySQL views to express the transformation. This, paired with indexes on the underlying physical table, works for common use cases.

### Pattern #3 - Materialized Views/ETL pipeline

If none of the above patterns solve your use cases, you can build your ETL pipeline transformations and optimize data for your application's read use cases. Use Supaglue's [webhook sync notifications](../api/v2/mgmt/sync-complete-2) to trigger your pipelines.

## Schema Evolution

Supaglue may evolve the destination table schemas from time to time. To evolve schemas, drop your destination tables, and Supaglue will recreate the tables with the new schemas. Please reach out to ([support@supaglue.com](mailto:support@supaglue.com)) if you need support for backward-compatible strategies.

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
