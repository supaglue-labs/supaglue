---
description: ''
---

# MongoDB

## Overview

:::info
Supaglue currently only supports MongoDB Atlas.
:::

| Feature                                                       | Available |
| ------------------------------------------------------------- | --------- |
| Data normalization                                            | No        |
| Data invalidation for Unified API (also see Provider details) | Yes       |

## Setup

:::info
Supaglue currently only supports username/password authentication, not X.509.
:::

:::info
Note that the MongoDB user will need write access to the database you choose.
:::

### Creating a MongoDB Atlas user

1. Navigate to the "Database Access" tab in the MongoDB Atlas interface.
1. Click "Add New Database User".
1. Make sure the Authenication Method is set to "Password".
1. Enter a username and password.
1. In the "Specific Privileges" section, click "Add Specific Privilege".
1. Select the role "readWrite" and specify the database you want to sync to. Leave "Collection" blank as we create collections for you in this database.
1. Click "Add User".

### Configuring the MongoDB destination

1. Go to Connectors -> Destinations.
1. Click the Configure button on the MongoDB card.
1. Enter your MongoDB credentials.
1. Click Test, then Save.

![mongodb-config](/img/mongodb_form.png)

## Query patterns

Here are a few high-level best practices when working with collections that Supaglue land:

- It's OK to add indexes. Just be aware of the upkeep costs

### Pattern #1 - Direct query

The simplest way to query data is to directly query the tables that Supaglue lands. This is well-suited for simple queries. You may optionally add indexes to help query performance.

### Pattern #2 - Using Mongo views

If you require lightweight transformations and aggregations, consider using [Mongo views](https://www.mongodb.com/docs/v5.0/core/views/), like SQL views, to create a projection on your data. Read more about it in our [Mongo and Prisma views tutorial](../tutorials/mongo-view-prisma-view).

## Schema Evolution

Supaglue may evolve the destination table schemas from time to time. Drop your destination collections to evolve schemas, and Supaglue will recreate the collections with the new schemas. Please get in touch with [support@supaglue.com](mailto:support@supaglue.com) if you need support for backward-compatible strategies.

## IP Whitelist

The following are Supaglue's CIDR ranges:

```
54.214.243.61/32
54.201.123.169/32
44.226.37.107/32
```
