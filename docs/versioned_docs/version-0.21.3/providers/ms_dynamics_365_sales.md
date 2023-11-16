---
sidebar_custom_props:
  icon: /img/connector_icons/ms_dynamics_365_sales.svg
  category: 'CRM'
description: ''
---

# Dynamics 365 Sales

## Overview

**Category:** `crm`

Supaglue uses the Microsoft Dynamics 365 v9.2 API.

| Feature                              | Available      |
| ------------------------------------ | -------------- |
| Authentication (`oauth2`)            | Yes            |
| Managed syncs                        | Yes            |
| &nbsp;&nbsp;&nbsp; Sync strategies   | (listed below) |
| Unified API                          | Yes            |
| &nbsp;&nbsp;&nbsp; Data invalidation | Yes            |
| Real-time events                     | No             |
| Passthrough API                      | Yes            |

#### Supported common objects:

| Object      | Soft delete supported | Sync strategy       |
| ----------- | --------------------- | ------------------- |
| Account     | Yes                   | Full or Incremental |
| Contact     | Yes                   | Full or Incremental |
| Lead        | Yes                   | Full or Incremental |
| Opportunity | Yes                   | Full or Incremental |
| User        | Yes                   | Full or Incremental |

#### Supported standard objects:

Use the logical name (i.e. `mailbox`) when specifying [standard entities](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/about-entity-reference) to sync.

Syncs are Full or Incremental, and soft deletes are supported.

#### Supported custom objects:

When specifying a custom entity you'd like to sync, omit the `new_` prefix and use the singular noun. For instance, if your custom entity's table is `new_customobjects`, you would specify `customobject` as the object name.

Syncs are Full or Incremental, and soft deletes are supported.

## Provider setup

To connect to your customers' Microsoft Dynamics 365 Sales instances, you'll need to update the redirect URL to point to Supaglue, enable API permissions, and fetch the API access credentials in your [Azure account](https://portal.azure.com/).

### Add Redirect URL to your Azure app

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your HubSpot app:

1. Login to your Azure console: <https://portal.azure.com/>
1. Navigate to Active Directory and find your application under "App registrations" from the left menu, in the "All applications" tab.

   ![azure_app_oauth](/img/azure_app_oauth.png 'azure app oauth')

1. Choose "Authentication" from the left menu, then under "Redirect URIs", click "Add URI" and paste Supaglue's redirect URL:

   `https://api.supaglue.io/oauth/callback`

1. Click Save to update your changes.

### Enable API permissions

1. Go to API permissions from the left menu.

1. Click "Add a permission" and select Dynamics 365.

1. Under permissions, check the box for `user_impersonation`.

   ![dynamics_api_permissions](/img/dynamics_api_permissions.png 'dynamics api permissions')

### Fetch Azure App credentials

1. Copy the Consumer Key, Consumer Secret, and paste them into the Microsoft Dynamics 365 Sales configuration form in the management portal.

1. Copy the "Client ID" and "Client secret" values into the Supaglue Management Portal.
