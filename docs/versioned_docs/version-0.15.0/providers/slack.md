---
sidebar_custom_props:
  icon: /img/connector_icons/slack.png
  category: 'Communications'
description: ''
---

# Slack

## Overview

**Category:** `messaging`

| Feature                              | Available |
| ------------------------------------ | --------- |
| Authentication (`oauth2`)            | Yes       |
| Managed syncs                        | No        |
| &nbsp;&nbsp;&nbsp; Sync strategies   |           |
| Unified API                          | No        |
| &nbsp;&nbsp;&nbsp; Data invalidation | No        |
| Real-time events                     | No        |
| Passthrough API                      | Yes       |

## Provider setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' HubSpot instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [HubSpot developer account](https://developers.hubspot.com).

### Add Redirect URL to your HubSpot app

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your Slack app:

1. Log in to your Slack developer account: <https://api.slack.com/apps/>
2. Navigate to your Application or create a new one, then go to the "OAuth & Permissions" tab.

   <BrowserWindow url="api.slack.com/apps/A05U8PFAKJL/oauth">

   ![slack_connected_app_oauth](/img/slack_connected_app_oauth.png 'slack connected app oauth')

   </BrowserWindow>

3. Under "Redirect URLs", paste Supaglue's redirect URL:

   <Tabs>
   <TabItem value="supaglue-cloud" label="Supaglue Cloud" default>

   ```
   https://api.supaglue.io/oauth/callback
   ```

   </TabItem>
   <TabItem value="localhost" label="Localhost">

  Unfortunately Slack does not support http urls for localhost, so you will need to use a workaround such as ngrok to make your local development instance https accessible, e.g.
   ```
   https://xxxxx.ngrok-free.app/oauth/callback
   ```

   </TabItem>
   </Tabs>

4. Click "Save URLs" to update your changes.

### Fetch Slack Public App credentials

Copy the Client ID, Client secret, and scopes (comma-separated), and paste them into the Slack configuration form in the management portal.
