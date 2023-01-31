---
sidebar_position: 2
---

# Developer Config

A Developer Config is a Typescript object that declaratively defines the behavior of a set of [Sync Configs](developer_config#sync-config). It also contains metadata about Salesforce as a data source.

A Developer Config is authored by the developer and deployed to the Supaglue Integration Service backend which is responsible for executing the sync.

#### Schema

```typescript
type DeveloperConfigSpec = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

type SyncConfig = {
  name: string;
  salesforceObject: 'Contact' | 'Lead' | 'Account';
  cronExpression: string;
  destination: Destination;
  strategy: 'full_refresh';
  defaultFieldMapping?: FieldMapping[];
};

type SalesforceCredentials = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};
```

See the [Salesforce section](integrations/salesforce) of the docs for references and example Developer Config.

## Sync Config

A Sync Config is a Typescript object that declaratively defines the behavior of one [Sync](developer_config#sync). One Sync Config defines the following:

1. The object type to sync from Salesforce (Contact/Lead/Account/Opportunity)
2. How often it should sync
3. Where it should deliver the records
4. How field mappings between Salesforce and the developer's application should work (i.e. which fields are exposed, how they are displayed, and their default field mappings)
5. Other operational configurations around retries, fetch strategies, and more

:::info

NOTE: A Developer Config is a set of Sync Configs. Your application will likely have one Developer Config, but several Sync Configs.

:::
