---
description: ''
---

# HubSpot setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' HubSpot instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [HubSpot developer account](https://developers.hubspot.com).

## Add Redirect URL to your HubSpot app.

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your HubSpot app:

1. Login to your HubSpot developer account: https://app.hubspot.com/developer
1. Navigate to your Connected Application under "Apps" and go to the "Auth" tab.

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

    - `crm.objects.contacts.read`
    - `crm.objects.companies.read`
    - `crm.objects.deals.read`
    - `crm.objects.owners.read`
    - `crm.lists.read`
    - `crm.objects.custom.read`
    - `crm.schemas.custom.read`

    Required for writes:

    - `crm.objects.contacts.write`
    - `crm.objects.companies.write`
    - `crm.objects.deals.write`
    - `crm.lists.write`
    - `crm.objects.custom.write`
    - `crm.schemas.custom.write`

1. Click Save to update your changes.

## Fetch HubSpot Connected App credentials

1. Copy the Consumer Key, Consumer Secret, and scopes (comma-separated), and paste them into the HubSpot configuration form in the management portal.

1. Copy the "Client ID" and "Client secret" values into the Supaglue Management Portal.
