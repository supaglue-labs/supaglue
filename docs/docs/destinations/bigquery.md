---
description: ''
---

# BigQuery

## Overview

| Feature                              | Available |
| ------------------------------------ | --------- |
| Syncs: Full refresh                  | Yes       |
| Syncs: Incremental refresh           | Yes       |
| Syncs: Supports incremental deletes  | Yes       |
| Cache invalidation on write          | No        |
| Common objects (unified by Supaglue) | Yes       |
| Standard objects (per provider)      | Yes       |
| Custom objects (per provider)        | Yes       |

## Setup

1. Go to Configuration -> Destinations.
2. Click the Configure button on the BigQuery card.
3. Enter your BigQuery dataset and upload your service account JSON file.

:::info
Note that the service account will need the following roles attached:

- BigQuery Data Editor
- BigQuery Job User

If these roles are too broad for your security policies, you can [create a custom role](https://cloud.google.com/iam/docs/creating-custom-roles) with the following permissions:

- bigquery.datasets.get
- bigquery.tables.create
- bigquery.tables.delete
- bigquery.tables.get
- bigquery.tables.getData
- bigquery.tables.list
- bigquery.tables.update
- bigquery.tables.updateData
- bigquery.jobs.create

You can also add [conditional access policies](https://cloud.google.com/bigquery/docs/control-access-to-resources-iam) to restrict access to specific datasets.
:::

![bigquery-config](/img/bigquery-form.png)

## Query patterns

Here are a few high-level best practices when working with tables that Supaglue land:

- Avoid altering the schema of the existing columns

There are a few patterns (from simplest to more complex) for querying tables that Supaglue writes into your BigQuery dataset:

### Pattern #1 - Direct query

The simplest way to query data is to directly query the tables that Supaglue lands. This is well-suited for simple queries.

### Pattern #2 - Logical view

If you need to transform the data that Supaglue lands, you can create BigQuery views to express the transformation. This works for common use cases.

### Pattern #3 - Materialized Views/ETL pipeline

If none of the above patterns solve your use cases, you can build your ETL pipeline transformations and optimize data for your application's read use cases. Use Supaglue's [webhook sync notifications](../api/v2/mgmt/sync-complete) to trigger your pipelines.

## Schema Evolution

Supaglue may evolve the destination table schemas from time to time. To evolve schemas, drop your destination tables, and Supaglue will recreate the tables with the new schemas. Please reach out to ([support@supaglue.com](mailto:support@supaglue.com)) if you need support for backward-compatible strategies.

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
