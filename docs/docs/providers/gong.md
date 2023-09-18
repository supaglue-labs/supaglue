---
sidebar_custom_props:
  icon: /img/connector_icons/gong.png
  category: 'Sales engagement'
description: ''
---

# Gong

## Overview

**Category:** engagement

Supaglue uses the Gong V2 API.

| Feature                              | Available      |
| ------------------------------------ | -------------- |
| Authentication (`access_key_secret`) | Yes            |
| Managed syncs                        | Yes            |
| &nbsp;&nbsp;&nbsp; Sync strategies   | (listed below) |
| Unified API                          | No             |
| &nbsp;&nbsp;&nbsp; Data invalidation | No             |
| Real-time events                     | No             |
| Passthrough API                      | Yes            |

#### Supported common objects:

N/A

#### Supported standard objects:

| Object           | Soft delete supported | Sync strategy       |
| ---------------- | --------------------- | ------------------- |
| `call`           | No (Yes if "Full")    | Full or Incremental |
| `detailedCall`   | No (Yes if "Full")    | Full or Incremental |
| `callTranscript` | Yes                   | Full                |

#### Supported custom objects:

N/A

## Provider setup

To connect to your customers' Gong instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [Gong developer account](https://app.gong.io/developer-hub).

### Add Redirect URL to your Gong integration.

Supaglue provides a redirect URL to send information to your integration. To add the redirect URL to your Gong integration:

1. Log in to your Gong developer account: https://app.gong.io/developer-hub
1. Click "MANAGE APPS", and edit your integration.

![gong_integration](/img/gong_integration.png 'gong integration')

1.  Under "REDIRECT URI NEEDED FOR...", paste Supaglue's redirect URL:

    ```
    https://api.supaglue.io/oauth/callback
    ```

1.  Check the following scopes under "Scopes":

    Required for reads:

    - `api:calls:read:basic`
    - `api:calls:read:extensive`
    - `api:calls:read:transcript`

1.  Click Save to update your changes.

### Fetch Gong Integration credentials

Copy the Client ID, Client secret, and scopes (comma-separated), and paste them into the Gong configuration form in the management portal.
