---
description: ''
---

# Snowflake

## Overview

| Feature                                                       | Available |
| ------------------------------------------------------------- | --------- |
| Data normalization                                            | No        |
| Data invalidation for Unified API (also see Provider details) | No        |

## Setup

1. Go to Connectors -> Destinations.
2. Click the Configure button on the Snowflake card.
3. Enter your Snowflake credentials.

## Query patterns

Here are a few high-level best practices when working with tables that Supaglue land:

- Avoid altering the schema of the existing columns

There are a few patterns (from simplest to more complex) for querying tables that Supaglue writes into your Snowflake database:

## Schema Evolution

Supaglue may evolve the destination table schemas from time to time. To evolve schemas, drop your destination tables, and Supaglue will recreate the tables with the new schemas. Please reach out to ([support@supaglue.com](mailto:support@supaglue.com)) if you need support for backward-compatible strategies.

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
