# Authentication

Learn how to authenticate your requests to Supaglue's API.

## Overview

When you make a request to the Supaglue API, you will need to be an authorized user. Use an API key to identify yourself as an authorized user.

API keys are generated using the Management Portal under the Configuration -> API Key page.

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
