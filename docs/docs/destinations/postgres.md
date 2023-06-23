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

We recommend creating a separate Supaglue role, user, and schema:

```sql
create schema supaglue;

create role supaglue_role;
grant connect on database <your db name> to supaglue_role;
grant all privileges on schema supaglue to supaglue_role;
grant all privileges on all tables in schema supaglue to supaglue_role;
alter default privileges in schema supaglue grant all privileges on tables to supaglue_role;
grant supaglue_role to supaglue_user;

```

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
