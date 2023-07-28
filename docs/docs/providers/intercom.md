---
sidebar_custom_props:
  icon: /img/connector_icons/intercom.png
  category: 'Ticketing'
description: ''
---

# Intercom

## Overview

| Feature                            | Available |
| ---------------------------------- | --------- |
| Auth                               | Yes       |
| Managed syncs (standard objects)   | Yes       |
| Managed syncs: incremental deletes | No        |
| Action API                         | No        |
| Real-time events                   | No        |

Supported standard objects:

- `admin`
- `article`
- `company`
- `contact`
- `conversation`
- `news_item`

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

  <BrowserWindow url="https://app.intercom.com/a/apps/asdfg/developer-hub/app-packages/111111/oauth/edit">

  ![gong_integration](/img/intercom_integration.png 'gong integration')

  </BrowserWindow>

1. Under Redirect URLs, paste Supaglue's redirect URL:
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

1. Ensure all the necessary scopes are checked.
1. Click Save to update your changes.

### Fetch Intercom Integration credentials

Navigate to Basic information, and copy the Client ID and Client secret, and paste them into the Intercom configuration form in the management portal.
