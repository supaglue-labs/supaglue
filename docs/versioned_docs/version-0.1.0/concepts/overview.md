---
sidebar_position: 1
---

# Overview

This section goes over the lifecycle of the developer and customer flow using Supaglue.

<p align="center">
  <a href="#"><img src="/img/flow.png" alt="Supaglue" width="600px"/></a>
</p>

1. A [Developer Config](developer_config) is authored by developers to define a set of [Sync Configs](developer_config#sync-config) each of which define the behavior of a [Sync](sync)
2. Once a Developer Config is deployed to the [Supaglue Integration Service](architecture), the Syncs become available for customers to use
3. Customers opt-in and use Syncs by saving [Sync Values](sync#sync-values) to the Supaglue Integration Service using [Supaglue React components](react-components) which are embedded by developers into their applications
4. The Supaglue Integration Service executes Syncs, using the customer-provided Sync Values during runtime, as a [Sync Run](sync#sync-run)
5. A Sync Run operates on your customer's Salesforce and your application, moving data between the two systems
6. Developers can use the [CLI](cli) to monitor the statuses of Syncs
