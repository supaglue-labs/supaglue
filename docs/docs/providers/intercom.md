---
sidebar_custom_props:
  icon: /img/connector_icons/intercom.png
  category: 'Ticketing'
description: ''
---

# Intercom

## Overview

**Category:** `ticketing`

Supaglue uses the Intercom V2.9 API.

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

N/A

#### Supported standard objects:

| Object         | Soft delete supported | Sync strategy       |
| -------------- | --------------------- | ------------------- |
| `admin`        | Yes                   | Full                |
| `article`      | Yes                   | Full                |
| `company`      | Yes                   | Full                |
| `contact`      | No\*                  | Full or Incremental |
| `conversation` | No\*                  | Full or Incremental |

[*] Soft deletes are supported if the sync strategy is "Full"

#### Supported custom objects:

N/A

## Provider setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' Intercom instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [Intercom developer hub](https://developers.intercom.com/).

### Add Redirect URL to your Intercom integration.

Supaglue provides a redirect URL to send information to your integration. To add the redirect URL to your Intercom integration:

1. Navigate to https://developers.intercom.com.
1. Click "Your Apps" on the top right corner and log in.
1. Click on the the App you want to edit.
1. Click on Authentication, and press Edit.

   ![gong_integration](/img/intercom_integration.png 'gong integration')

1. Under Redirect URLs, paste Supaglue's redirect URL:

   ```
   https://api.supaglue.io/oauth/callback
   ```

1. Ensure all the necessary scopes are checked.
1. Click Save to update your changes.

### Fetch Intercom Integration credentials

Navigate to Basic information, and copy the Client ID and Client secret, and paste them into the Intercom configuration form in the management portal.
