---
description: ''
---

# Salesforce setup

import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

To connect to your customers' Salesforce instances, you'll need to update the redirect URL to point to Supaglue and fetch the API access credentials in your [Salesforce developer account](https://developer.salesforce.com).

## Add Redirect URL to your Salesforce app.

Supaglue provides a redirect URL to send information to your app. To add the redirect URL to your Salesforce app:

1. Log in to your Salesforce dashboard.

1. Navigate to the gear icon at the top of the page and click Setup.

1. In the left-hand sidebar, go to Platform Tools > Apps > App Manager.

1. Click on the registered application you'd like to use. If you don't already have one, click New Connected App.

1. Under API (Enable OAuth Settings), mark the "Enable OAuth Settings" checkbox.

1. Under Callback URL, paste Supaglue's redirect URL:

<Tabs>
<TabItem value="supaglue-cloud" label="Supaglue Cloud">

```
https://api.supaglue.io/oauth/callback
```

</TabItem>
<TabItem value="localhost" label="Localhost" default>

```
http://localhost:8080/oauth/callback
```
</TabItem>
</Tabs>

1. Enable the following scopes: `id`, `api`, `refresh_token`

   <BrowserWindow url="acmecorp.my.salesforce.com/app/mgmt/forceconnectedapp/forceAppEdit.apexp">

   ![sfdc_connected_app_oauth](/img/sfdc_connected_app_oauth.png 'sfdc connected app oauth')

   </BrowserWindow>

1. Press the Save button at the bottom of the page.

## Fetch Salesforce Connected App credentials

1. Navigate to Manage Connected Apps > API (Enable OAuth Settings) > Manage Consumer Details on your Salesforce App page.

1. Copy the Consumer Key, Consumer Secret, and scopes (comma-separated), and paste them into the Salesforce configuration form in the management portal.
