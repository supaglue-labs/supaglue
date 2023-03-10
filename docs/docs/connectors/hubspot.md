# HubSpot

## Overview

Supaglue interfaces with the HubSpot V3 API using Hubspot's official nodejs client and its getAll() functionality.

Status: Alpha

| Feature                    | Available |
| -------------------------- | --------- |
| Auth                       | Yes       |
| Reads: Full refresh        | Yes       |
| Reads: Incremental refresh | No        |
| Creates                    | Yes       |
| Updates                    | Yes       |
| Handles rate limits        | No        |

Supported object types:

- Company
- Contact
- Deal

## Common Model sync frequencies

_The default sync frequency is 15 minutes (900000 ms)._

Sync frequencies can be configured by setting the `SUPAGLUE_SYNC_PERIOD_MS` environment variable defined in `.env`.
