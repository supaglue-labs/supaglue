---
sidebar_custom_props:
  icon: /img/connector_icons/apollo.png
  category: 'Sales engagement'
description: ''
---

# Apollo

## Overview

Apollo is both a sales engagement connector and a data enrichment provider.

| Feature                            | Available |
| ---------------------------------- | --------- |
| Authentication                     | Yes       |
| Managed syncs                      | Yes       |
| Actions API                        | Yes       |
| Real-time events                   | No        |
| Passthrough API                    | Yes       |


**Note: Only full (non-incremental) syncs are supported.

Supported common objects:

- Users
- Contacts
- Sequences
- Sequence States
- Mailboxes (also known as Email Accounts)

## Provider setup

To enable the Apollo provider on Supaglue, simply navigate to the Apollo Provider configuration page and click "Enable".

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
