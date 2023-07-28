---
sidebar_custom_props:
  icon: /img/connector_icons/gong.png
  category: 'Sales engagement'
description: ''
---

# Gong

## Overview

Supaglue interfaces with the Gong V2 API.

| Feature                            | Available |
| ---------------------------------- | --------- |
| Authentication                     | Yes       |
| Managed syncs                      | Yes       |
| Actions API                        | No        |
| Real-time events                   | No        |
| Passthrough API                    | Yes       |

Supported standard objects:

- `call`
- `detailedCall`
- `callTranscript`: this will do a full refresh on each sync

## Provider setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' Gong instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [Gong developer account](https://app.gong.io/developer-hub).

### Add Redirect URL to your Gong integration.

Supaglue provides a redirect URL to send information to your integration. To add the redirect URL to your Gong integration:

1. Log in to your Gong developer account: https://app.gong.io/developer-hub
1. Click "MANAGE APPS", and edit your integration.

  <BrowserWindow url="123456.app.gong.io/company/api-authentication?workspace-id=123456&company-id=123456">

  ![gong_integration](/img/gong_integration.png 'gong integration')

  </BrowserWindow>

1. Under "REDIRECT URI NEEDED FOR...", paste Supaglue's redirect URL:
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

    - `api:calls:read:basic`
    - `api:calls:read:extensive`
    - `api:calls:read:transcript`

1. Click Save to update your changes.

### Fetch Gong Integration credentials

Copy the Client ID, Client secret, and scopes (comma-separated), and paste them into the Gong configuration form in the management portal.
