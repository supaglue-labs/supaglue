---
sidebar_position: 3
---

# Sync

A Sync is a deployed Sync Config that is available for customers to use. Customers interact with Syncs in your application's UI using embedded Supaglue React components.

## Sync Values

Sync Values are customer-provided values related to Syncs that are used at runtime by the Supaglue Integration Service.

## Sync Run

A Sync Run is one instance of Sync execution.

```typescript
type SyncRun = {
  id: string;
  syncId: string;
  result: SyncRunResult;
  startTimestamp: Date;
};
```
