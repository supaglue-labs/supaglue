---
sidebar_custom_props:
  icon: /img/connector_icons/ms_dynamics_365_sales.png
  category: 'CRM'
description: ''
---

# Dynamics 365 Sales

## Overview

Supaglue interfaces with the Microsoft Dynamics 365 V9 API.

| Feature          | Available |
| ---------------- | --------- |
| Auth             | Yes       |
| Managed syncs    | Yes       |
| Point reads      | Yes       |
| Creates          | No        |
| Updates          | No        |
| Real-time events | No        |

Supported object types:

- Account
- Contact
- Lead
- Opportunity
- User

## Provider setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' Microsoft Dynamics 365 Sales instances, you'll need to update the redirect URL to point to Supaglue, enable API permissions, and fetch the API access credentials in your [Azure account](https://portal.azure.com/).

### Add Redirect URL to your Azure app

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your HubSpot app:

1. Login to your Azure console: <https://portal.azure.com/>
1. Navigate to Active Directory and find your application under "App registrations" from the left menu, in the "All applications" tab.

    <BrowserWindow url="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/6bf0afcb-7896-45d4-b6ad-b42655b4c321/isMSAApp~/false">

    ![azure_app_oauth](/img/azure_app_oauth.png 'azure app oauth')

    </BrowserWindow>

1. Choose "Authentication" from the left menu, then under "Redirect URIs", click "Add URI" and paste Supaglue's redirect URL:

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

1. Click Save to update your changes.

### Enable API permissions

1. Go to API permissions from the left menu.

1. Click "Add a permission" and select Dynamics 365.

1. Under permissions, check the box for `user_impersonation`.

  <BrowserWindow url="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/9a0ed275-1fd4-4099-b809-a2030f4f4e07/isMSAApp~/false">

  ![dynamics_api_permissions](/img/dynamics_api_permissions.png 'dynamics api permissions')

  </BrowserWindow>

### Fetch Azure App credentials

1. Copy the Consumer Key, Consumer Secret, and paste them into the Microsoft Dynamics 365 Sales configuration form in the management portal.

1. Copy the "Client ID" and "Client secret" values into the Supaglue Management Portal.
