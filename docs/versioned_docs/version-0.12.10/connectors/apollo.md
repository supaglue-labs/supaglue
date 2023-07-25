---
sidebar_custom_props:
  icon: /img/connector_icons/apollo.png
  category: 'Sales engagement'
description: ''
---

# Apollo

## Overview

| Feature                    | Available |
| -------------------------- | --------- |
| Auth                       | Yes*      |
| Managed syncs              | Yes**     |
| Point reads                | Yes       |
| Action API                 | Yes       |
| Real-time events           | No        |

*Note: Apollo does not support Oauth connections, so only API Key based connections are supported.
**Note: Only full (non-incremental) syncs are supported.

Supported common objects:

- Users
- Contacts
- Sequences
- Sequence States
- Mailboxes (also known as Email Accounts)

## Provider setup

To enable the Apollo provider on Supaglue, simply navigate to the Apollo Provider configuration page and click "Enable".

## Connection setup

Unlike our other providers, Apollo currently does not support OAuth connections. To establish a connection with your customer's Apollo instance, you will need the customer to input their Apollo API Key, and then call the following:

```
curl --location 'https://api.supaglue.io/mgmt/v2/customers/{CUSTOMER_ID}/connections' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {SUPAGLUE_API_KEY}' \
--data '{
    "provider_name": "apollo",
    "category": "engagement",
    "api_key": "{APOLLO_API_KEY}"
}'
```

- `{CUSTOMER_ID}` - your customer's ID
- `{SUPAGLUE_API_KEY}` - your API key obtained from the Supaglue management portal
- `{APOLLO_API_KEY}` - your customer's Apollo API Key
