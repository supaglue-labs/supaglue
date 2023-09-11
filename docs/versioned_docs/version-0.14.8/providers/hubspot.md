---
sidebar_custom_props:
  icon: /img/connector_icons/hubspot.png
  category: 'CRM'
description: ''
---

# HubSpot

## Overview

**Category:** `crm`, `marketing_automation`

Supaglue uses the HubSpot V3 API.

| Feature                              | Available                                         |
| ------------------------------------ | ------------------------------------------------- |
| Authentication (`oauth2`)            | Yes                                               |
| Managed syncs                        | Yes                                               |
| &nbsp;&nbsp;&nbsp; Sync strategies   | `full then incremental`\* (soft delete supported) |
| Unified API                          | Yes                                               |
| &nbsp;&nbsp;&nbsp; Data invalidation | Yes                                               |
| Real-time events                     | No                                                |
| Passthrough API                      | Yes                                               |

#### Supported CRM common objects:

- Company
- Contact
- Deal
- User ([*] Sync strategy: `full only`)

:::info
Note: if only associations change in between syncs, Supaglue syncs will not reflect it until the relevant common object is modified.
:::

#### Supported CRM standard objects:

`company`, `contact`, `deal`, `line_item`, `product`, `ticket`, `quote`, `call`, `communication`, `email`, `meeting`, `note`, `postal_mail`, `task`.

#### Supported CRM custom objects:

Use the internal names when configuring the `SyncConfig`. See [HubSpot's documentation](https://knowledge.hubspot.com/crm-setup/create-custom-objects) for more information. If you created the custom object through Supaglue's API, the internal name is equivalent to the `name` field.

#### Supported Marketing Automation common objects:

- Forms

:::note
We only support Unified API for `marketing_automation`.
:::

## Provider setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' HubSpot instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [HubSpot developer account](https://developers.hubspot.com).

### Add Redirect URL to your HubSpot app

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your HubSpot app:

1. Log in to your HubSpot developer account: <https://app.hubspot.com/developer>
1. Navigate to your Public Application under "Apps" and go to the "Auth" tab.

   <BrowserWindow url="app.hubspot.com/developer/12345678/application/123456">

   ![hubspot_connected_app_oauth](/img/hubspot_connected_app_oauth.png 'hubspot connected app oauth')

   </BrowserWindow>

1. Under "Redirect URLs", paste Supaglue's redirect URL:

   <Tabs>
   <TabItem value="supaglue-cloud" label="Supaglue Cloud" default>

   ```
   https://api.supaglue.io/oauth/callback
   ```

   </TabItem>
   <TabItem value="localhost" label="Localhost">

   ```
   http://localhost:8080/oauth/callback
   ```

   </TabItem>
   </Tabs>

1. Check the following scopes under "Scopes":

   Required for CRM reads (common objects):

   - `crm.objects.owners.read`
   - `crm.objects.companies.read`
   - `crm.lists.read`
   - `crm.objects.deals.read`
   - `crm.objects.contacts.read`
   - `crm.objects.custom.read` (required for custom objects)
   - `crm.schemas.custom.read` (required for custom objects)

   Required for CRM writes (common objects):

   - `crm.objects.contacts.write`
   - `crm.objects.companies.write`
   - `crm.objects.deals.write`
   - `crm.lists.write`
   - `crm.objects.custom.write`
   - `crm.schemas.custom.write`

   Required for Forms:

   - `forms`

   :::info
   Supaglue requires a set of minimum scopes to support reads and writes to common object records.
   :::

1. Click Save to update your changes.

### Fetch HubSpot Public App credentials

Copy the Client ID, Client secret, and scopes (comma-separated), and paste them into the HubSpot configuration form in the management portal.
