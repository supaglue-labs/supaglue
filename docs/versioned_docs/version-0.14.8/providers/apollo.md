---
sidebar_custom_props:
  icon: /img/connector_icons/apollo.png
  category: 'Sales engagement'
description: ''
---

# Apollo

## Overview

**Category:** `engagement`, `enrichment`

Apollo is both a sales engagement connector and a data enrichment provider.

| Feature                              | Available   |
| ------------------------------------ | ----------- |
| Authentication (`api_key`)           | Yes         |
| Managed syncs                        | Yes         |
| &nbsp;&nbsp;&nbsp; Sync strategies   | `full only` |
| Unified API                          | Yes         |
| &nbsp;&nbsp;&nbsp; Data invalidation | No          |
| Real-time events                     | No          |
| Passthrough API                      | Yes         |

#### Supported Engagement common objects:

- Users
- Contacts
- Sequences (soft delete supported)
- Sequence States
- Mailboxes (aka Email Accounts)

#### Supported standard objects:

N/A

#### Supported custom objects:

N/A

## Provider setup

To enable the Apollo provider on Supaglue, navigate to the Apollo Provider configuration page and click "Enable".

![apollo_auth](/img/apollo_auth.png 'apollo auth config')

## Connection setup

Apollo supports API key authentication. To establish a connection with your customer's Apollo instance, you will need the customer to input their Apollo API Key, and then call the following:

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
