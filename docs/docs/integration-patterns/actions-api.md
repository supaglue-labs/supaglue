---
description: ''
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Actions API

The Actions API lets you perform common operations on your customers' SaaS tools.
![actions_api_diagram](/img/actions-api-diagram.png 'actions API diagram')

## How it works

1. You call Supaglue’s Actions API with a request payload.
2. Supaglue applies mappings and updates the data in Salesforce (or other remote provider). You can use Supaglue’s default unified mappings or your own.
3. Optional: Supaglue updates your application DB for the corresponding record, before returning a 200 response (see cache invalidation).

## Unified API and schema

Where possible, Supaglue unifies action API endpoints and request/response signatures across providers within a single category.

For example, you can update an Salesforce Account record and HubSpot Company record with the same API endpoint and schema, just by changing a header:

<Tabs>

<TabItem value="hubspot" label="HubSpot" default>

```shell

curl --location --request POST 'https://api.supaglue.io/crm/v1/contacts' \
--header 'x-customer-id: 9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677' \
--header 'x-provider-name: hubspot' \
--header 'x-api-key: {{apiKey}}' \
--header 'Content-Type: application/json' \
--data '{
    "model": {
        "first_name": "John", 
        "last_name": "Doe"
    }    
}'
```

</TabItem>

<TabItem value="salesforce" label="Salesforce">

```shell

curl --location --request POST 'https://api.supaglue.io/crm/v1/contacts' \
--header 'x-customer-id: 9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677' \
--header 'x-provider-name: salesforce' \
--header 'x-api-key: {{apiKey}}' \
--header 'Content-Type: application/json' \
--data '{
    "model": {
        "first_name": "John", 
        "last_name": "Doe"
    }    
}'
```

</TabItem>

</Tabs>

## Cache invalidation

If you have configured a destination for managed syncs, Supaglue will immediately reflect any newly created records or updated records in your destination.

For example, if you have updated an Account record in Salesforce, Supaglue will update the corresponding Account record in your Postgres database.

Cache invalidation helps maintain data consistency between your customers' CRM and your destination database.

:::info
This feature is only supported for some destinations, not all.

:::

## Pass-through API

For any action not directly supported by Supaglue's API, you can use our pass-through API. This lets you make any API call directly against the remote provider.