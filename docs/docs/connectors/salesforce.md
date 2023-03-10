# Salesforce

## Overview

Supaglue interfaces with the Salesforce async Bulk 2.0 API using the JSforce client.

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

- Account
- Contact
- Lead
- Opportunity

## Common Model sync frequencies

_The default sync frequency is 15 minutes (900000 ms)._

Sync frequencies can be configured by setting the `SUPAGLUE_SYNC_PERIOD_MS` environment variable defined in `.env`.
