---
description: ''
---

# BigQuery

## Overview

| Feature                           | Available |
| --------------------------------- | --------- |
| Data normalization                | No        |
| Data invalidation for Unified API | No        |

## Setup

1. Go to Connectors -> Destinations.
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

## Schema Evolution

Supaglue may evolve the destination table schemas from time to time. To evolve schemas, drop your destination tables, and Supaglue will recreate the tables with the new schemas. Please reach out to ([support@supaglue.com](mailto:support@supaglue.com)) if you need support for backward-compatible strategies.

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
