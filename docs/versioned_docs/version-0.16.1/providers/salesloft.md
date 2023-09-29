---
sidebar_custom_props:
  icon: /img/connector_icons/salesloft.png
  category: 'Sales engagement'
description: ''
---

# Salesloft

## Overview

**Category:** `engagement`

Supaglue uses the Salesloft v2 API.

| Feature                              | Available      |
| ------------------------------------ | -------------- |
| Authentication (`oauth2`)            | Yes            |
| Managed syncs                        | Yes            |
| &nbsp;&nbsp;&nbsp; Sync strategies   | (listed below) |
| Unified API                          | Yes            |
| &nbsp;&nbsp;&nbsp; Data invalidation | Yes            |
| Real-time events                     | No             |
| Passthrough API                      | Yes            |

#### Supported common objects:

| Object           | Soft delete supported | Sync strategy       |
| ---------------- | --------------------- | ------------------- |
| Users            | No\*                  | Full or Incremental |
| Accounts         | No\*                  | Full or Incremental |
| Contacts         | No\*                  | Full or Incremental |
| Emails           | No\*                  | Full or Incremental |
| Sequences        | Yes                   | Full or Incremental |
| Sequences States | No\*                  | Full or Incremental |
| Mailboxes        | No\*                  | Full or Incremental |

[*] Soft deletes are supported if the sync strategy is "Full"

#### Supported standard objects:

N/A

#### Supported custom objects:

N/A
