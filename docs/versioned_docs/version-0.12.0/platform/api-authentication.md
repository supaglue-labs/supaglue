---
description: ''
---

import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# API authentication

All requests to the Supaglue API must be authenticated via an API key. API keys can be generated in the Management Portal on the Configuration -> API Key page.

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
