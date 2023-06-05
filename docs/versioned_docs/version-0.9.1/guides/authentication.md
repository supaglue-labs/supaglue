---
description: ''
---

# Authentication

All requests to the Supaglue API must be authenticated via an API key. API keys can be generated in the Management Portal on the Configuration -> API Key page.

![configuration-api-key](/img/configuration-api-key.png)

:::info

You will only be able to view the API key upon generation. Store it in a safe place.

When you regenerate an API key, the previous key is invalidated.

:::

Pass in the API key in requests to the Supaglue API as a header:

```curl
curl http://localhost:8080/crm/v1/contacts \ 
   -H 'x-api-key: ...'
```
