---
sidebar_position: 4
---

# Destination

A Destination is the target system of a Sync Config, either Postgres or a webhook.

#### Schema

```typescript
type BaseDestination = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
};
```

```typescript
export type PostgresDestination = BaseDestination & {
  type: 'postgres';
  config: {
    credentials: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
    };
    table: string;
    upsertKey: string;
    customerIdColumn: string;
  };
};
```

```typescript
export type WebhookDestination = BaseDestination & {
  type: 'webhook';
  config: {
    url: string;
    requestType: HttpRequestType;
    headers?: string | string[];
  };
};
```
