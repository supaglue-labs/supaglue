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

| Feature                              | Available      |
| ------------------------------------ | -------------- |
| Authentication (`api_key`)           | Yes            |
| Managed syncs                        | Yes            |
| &nbsp;&nbsp;&nbsp; Sync strategies   | (listed below) |
| Unified API                          | Yes            |
| &nbsp;&nbsp;&nbsp; Data invalidation | Yes            |
| Real-time events                     | No             |
| Passthrough API                      | Yes            |

#### Supported Engagement common objects:

| Object          | Soft delete supported | Sync strategy |
| --------------- | --------------------- | ------------- |
| Users           | Yes                   | Full          |
| Contacts        | Yes                   | Full          |
| Sequences       | Yes                   | Full          |
| Sequence States | Yes                   | Full          |
| Mailboxes       | Yes                   | Full          |

#### Supported standard objects:

N/A

#### Supported custom objects:

N/A

## Other limitations

Date: 9/14/2023

Apollo has a few hard limitations with its API:

- You cannot sync more than 10,000 records per Object type.
- You cannot sync more than 10,000 records per hour.
- You cannot sync more than 50,000 records per day.

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
