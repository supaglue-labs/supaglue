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

| Feature                              | Available                                           |
| ------------------------------------ | --------------------------------------------------- |
| Authentication (`oauth2`)            | Yes                                                 |
| Managed syncs                        | Yes                                                 |
| &nbsp;&nbsp;&nbsp; Sync strategies   | `full then incremental` (soft delete not supported) |
| Unified API                          | Yes                                                 |
| &nbsp;&nbsp;&nbsp; Data invalidation | Yes                                                 |
| Real-time events                     | No                                                  |
| Passthrough API                      | Yes                                                 |

#### Supported common objects:

- Users
- Accounts
- Contacts
- Emails
- Sequences (soft delete supported)
- Sequence States
- Mailboxes

#### Supported standard objects:

N/A

#### Supported custom objects:

N/A
