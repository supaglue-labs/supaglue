# Microsoft Dynamics 365 Sales

## Overview

Supaglue interfaces with the Microsoft Dynamics 365 V9 API.

Status: Alpha

| Feature                    | Available |
| -------------------------- | --------- |
| Auth                       | Yes       |
| Reads: Full refresh        | No        |
| Reads: Incremental refresh | No        |
| Creates                    | No        |
| Updates                    | No        |
| Handles rate limits        | No        |

Supported object types: -

## Common Model sync frequencies

_The default sync frequency is 15 minutes (900000 ms)._

Sync frequencies can be configured by setting the `SUPAGLUE_SYNC_PERIOD_MS` environment variable defined in `.env`.
