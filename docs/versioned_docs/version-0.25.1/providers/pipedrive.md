---
sidebar_custom_props:
  icon: /img/connector_icons/pipedrive.png
  category: 'CRM'
description: ''
---

# Pipedrive

## Overview

**Category:** `crm`

Supaglue uses the Pipedrive V1 API.

| Feature                              | Available                                       |
| ------------------------------------ | ----------------------------------------------- |
| Authentication (`oauth2`)            | Yes                                             |
| Managed syncs                        | Yes                                             |
| &nbsp;&nbsp;&nbsp; Sync strategies   | `full then incremental` (soft delete supported) |
| Unified API                          | Yes                                             |
| &nbsp;&nbsp;&nbsp; Data invalidation | Yes                                             |
| Real-time events                     | No                                              |
| Passthrough API                      | Yes                                             |

#### Supported common objects:

| Object      | Soft delete supported | Sync strategy       |
| ----------- | --------------------- | ------------------- |
| Account     | Yes                   | Full or Incremental |
| Contact     | Yes                   | Full or Incremental |
| Lead        | Yes                   | Full or Incremental |
| Opportunity | Yes                   | Full or Incremental |
| User        | Yes                   | Full or Incremental |

#### Supported standard objects:

N/A

#### Supported custom objects:

N/A

## Provider setup

:::info
This is under construction.
:::
