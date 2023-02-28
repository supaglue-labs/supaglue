---
sidebar_position: 2
---

# Salesforce

### Third-party provider information

Supaglue interfaces with the Salesforce async Bulk 2.0 API using the JSforce client.

### Common Model sync frequencies

_The default sync frequency is 15 minutes (900000 ms)._

Sync frequencies can be configured by setting the `SUPAGLUE_SYNC_PERIOD_MS` environment variable defined in `.env`.
