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

## Schema Evolution

Supaglue may evolve the destination table schemas from time-to-time. To evolve schemas, drop your destination tables and Supaglue will recreate the tables with the new schemas. Please reach out to ([support@supaglue.com](mailto:support@supaglue.com)) if you need support for backwards-compatible strategies.

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
