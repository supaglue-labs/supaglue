---
sidebar_custom_props:
  icon: /img/connector_icons/ms_dynamics_365_sales.svg
  category: 'CRM'
description: ''
---

# HubSpot

## Overview

Supaglue interfaces with the HubSpot V3 API.

| Feature                                          | Available |
| ------------------------------------------------ | --------- |
| Auth                                             | Yes       |
| Managed syncs (common, standard, custom objects) | Yes       |
| Managed syncs: incremental deletes               | Yes       |
| Point reads                                      | Yes       |
| Action API (common, custom objects)              | Yes       |
| Real-time events                                 | No        |

Supported common objects:

- Company
- Contact
- Deal
- User

Supported standard objects: `company`, `contact`, `deal`, `line_item`, `product`, `ticket`, `quote`, `call`, `communication`, `email`, `meeting`, `note`, `postal_mail`, `task`.

For custom objects, you should use their internal names when configuring the `SyncConfig`. See [HubSpot's documentation](https://knowledge.hubspot.com/crm-setup/create-custom-objects) for more information. If you created the custom object through Supaglue's API, the internal name is equivalent to the `name` field.

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

    Required for reads:

    - `crm.objects.owners.read`
    - `crm.objects.companies.read`
    - `crm.lists.read`
    - `crm.objects.deals.read`
    - `crm.objects.contacts.read`
    - `crm.objects.custom.read` (required for custom objects)
    - `crm.schemas.custom.read` (required for custom objects)

    Required for writes:

    - `crm.objects.contacts.write`
    - `crm.objects.companies.write`
    - `crm.objects.deals.write`
    - `crm.lists.write`
    - `crm.objects.custom.write`
    - `crm.schemas.custom.write`

    :::info
    Supaglue requires a set of minimum scopes to support reads and writes to common object records.
    :::

1. Click Save to update your changes.

### Fetch HubSpot Public App credentials

Copy the Client ID, Client secret, and scopes (comma-separated), and paste them into the HubSpot configuration form in the management portal.
