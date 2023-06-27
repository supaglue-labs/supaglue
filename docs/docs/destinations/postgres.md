---
description: ''
---

# Postgres

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
2. Click the Configure button on the Postgres card.
3. Enter your Postgres credentials.

:::info
Note that the postgres user will need write access to the schema you choose.
:::

![postgres-config](/img/postgres_form.png)

We recommend creating a separate Postgres role, user, and schema for Supaglue. Using the new Postgres user to run the following:

```sql
create schema supaglue;

create role supaglue_role;
grant connect on database <your db name> to supaglue_role;
grant all privileges on schema supaglue to supaglue_role;
grant all privileges on all tables in schema supaglue to supaglue_role;
alter default privileges in schema supaglue grant all privileges on tables to supaglue_role;
grant supaglue_role to supaglue_user;

```

## Query patterns

Here are a few high-level best practices when working with tables that Supaglue land:

- Avoid adding database constraints
- Avoid altering the schema of the existing columns
- Minimize adding columns to the tables
- It's OK to add indexes. Just be aware of the upkeep costs

There are a few patterns (from simplest to more complex) for querying tables that Supaglue writes into your Postgres:

### Pattern #1 - Direct Query
The simplest way to query data is to directly query the tables that Supaglue lands. This is well-suited for simple queries. You may optionally add indexes to help query performance.

### Pattern #2 - Logical view
If you need to transform the data that Supaglue land, you can create Postgres views to express the transformation. This, paired with indexes on the underlying physical table, works for common use cases.

### Pattern #3 - Generated Columns
If your transformations are too expensive at query time, you can use Postgres [Generated Columns](https://www.postgresql.org/docs/current/ddl-generated-columns.html) to improve query-time performance by pushing the transformation work to write time.

### Pattern #4 - Materialized Views/ETL pipeline
If none of the above patterns solve your use cases, you can build your ETL pipeline transformations and optimize data for your application's read use cases. Use Supaglue's [webhook sync notifications](/api/v2/mgmt#tag/Webhooks) to trigger your pipelines.

## Schema Evolution

Supaglue may evolve the destination table schemas from time to time. To evolve schemas, drop your destination tables, and Supaglue will recreate the tables with the new schemas. Please reach out to ([support@supaglue.com](mailto:support@supaglue.com)) if you need support for backward-compatible strategies.


## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
