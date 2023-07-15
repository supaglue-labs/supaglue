---
sidebar_custom_props:
  icon: /img/connector_icons/gong.png
  category: 'Sales engagement'
description: ''
---

# Gong

## Overview

Supaglue interfaces with the Gong V2 API.

| Feature                            | Available |
| ---------------------------------- | --------- |
| Auth                               | Yes       |
| Managed syncs (standard objects)   | Yes       |
| Managed syncs: incremental deletes | No        |
| Point reads                        | No        |
| Action API                         | No        |
| Real-time events                   | No        |

Supported standard objects:

- `call`
- `detailedCall`
- `callTranscript`: this will do a full refresh on each sync
