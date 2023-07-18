---
displayed_sidebar: api
---

import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# Introduction

Supaglue supports three APIs. The Management API creates customers, connections, and configure managed syncs. The Actions API consists of two unified APIs, one for CRM connectors and one for sales engagement connectors.

## Management API

- You can use the [Management API V2](v2/mgmt/supaglue-management-api) to manage customer integrations.

## Actions API

- You can use the [CRM API V2](v2/crm/supaglue-crm-api) to read and write data from and to third-party CRM providers.
- You can use the [Engagement API V2](v2/engagement/supaglue-engagement-api) (beta) to read and write data from and to third-party engagement providers.

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
