---
displayed_sidebar: api
---

import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# Introduction

Supaglue supports three types of APIs:

1. **Management**: configure all aspects of your integrations.
2. **Actions**: write to third-party Providers using [Entities](../platform/entities/overview) and [Objects](../platform/objects/overview).
3. **Unified Actions**: write to third-party Providers using Supaglue's [Common Schema](../platform/common-schema/overview).

### Management API

You can use the [Management API V2](v2/mgmt/management-api) to manage customer integrations.

### Actions API

You can use the [Actions API V2](v2/actions/actions-api) to write to third-party Providers using Entities and Objects.

### Unified Actions API

Unified Actions API are categorized by vertical. We support two verticals (`crm`, `engagement`) today:

- You can use the [CRM API V2](v2/crm/unified-crm-api) to write to third-party CRM Providers using Supaglue's Common Schema.

- You can use the [Engagement API V2](v2/engagement/unified-engagement-api) to write to third-party engagement Providers using Supaglue's Common Schema.

## API authentication

Your requests to the Supaglue API must contain an API key. You can generate an API key in the Management Portal on the Configuration -> API Key page.

<BrowserWindow url="https://app.supaglue.io/applications/1dad4014-c295-422b-b384-1379396defd1/configuration/api_keys">

![configuration-api-key](/img/configuration-api-key.png)

</BrowserWindow>

:::info

You will only be able to view the API key upon generation. Store it in a safe place.

When you regenerate an API key, the previous key is invalidated.

:::

Pass in the API key in requests to the Supaglue API as a header:

```curl
curl http://api.supaglue.io/crm/v2/contacts \
   -H 'x-api-key: ...'
```
