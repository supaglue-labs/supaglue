---
sidebar_custom_props:
  icon: /img/connector_icons/salesloft.png
  category: 'Sales engagement'
description: ''
---

# Salesloft

## Overview

**Category:** `engagement`

Supaglue uses the Salesloft v2 API.

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

| Object           | Soft delete supported | Sync strategy       |
| ---------------- | --------------------- | ------------------- |
| Users            | No\*                  | Full or Incremental |
| Accounts         | No\*                  | Full or Incremental |
| Contacts         | No\*                  | Full or Incremental |
| Emails           | No\*                  | Full or Incremental |
| Sequences        | Yes                   | Full or Incremental |
| Sequences States | No\*                  | Full or Incremental |
| Mailboxes        | No\*                  | Full or Incremental |

[*] Soft deletes are supported if the sync strategy is "Full"

#### Supported standard objects:

N/A

#### Supported custom objects:

N/A


## Provider setup

To connect to your customers' Salesloft instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [Salesloft developer account](https://developers.salesloft.com/).

### Add Redirect URL to your Salesloft developer app

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your new or existing Salesloft app:

1. Login to your Salesloft developer dashboard: <https://developers.salesloft.com/>
1. Navigate to Manage Apps, find your developer app in the OAuth Applications list, and click "Edit".

   ![azure_app_oauth](/img/salesloft_app_oauth.png 'azure app oauth')

1. Update the redirect URI to point to Supaglue:

  ```
  https://api.supaglue.io/oauth/callback
  ```

1. Click Save to update your changes.

### Fetch OAuth app credentials

1. Select your OAuth application again from the list view (not the edit button).

1. Copy the Application ID and Secret, and paste them into the Salesloft provider configuration form in the management portal, for client ID and client secret, respectively.
