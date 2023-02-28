---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart

In less than 5 minutes, sync data from HubSpot or Salesforce into Supaglue and query it using a unified API.

[GIF]

## 1. Run Supaglue locally

Clone our repo, run our setup script which will create an `.env` file for this quickstart, and run the Supaglue stack locally using docker compose:

```shell
git clone -b v0.3.0 git@github.com:supaglue-labs/supaglue.git && cd supaglue
./scripts/create_quickstart_env.sh
yarn install
docker compose up
```

## 2. Authenticate Supaglue example app

Click the links below to simulate a customer connecting their HubSpot or Salesforce account to your app.

- **Salesforce:** [http://localhost:8080/oauth/connect?customerId=9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677&providerName=salesforce](http://localhost:8080/oauth/connect?customerId=9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677&providerName=salesforce&returnUrl=http://localhost:3001/quickstart)

- **HubSpot:** [http://localhost:8080/oauth/connect?customerId=ea3039fa-27de-4535-90d8-db2bab0c0252&providerName=hubspot](http://localhost:8080/oauth/connect?customerId=ea3039fa-27de-4535-90d8-db2bab0c0252&providerName=hubspot&returnUrl=http://localhost:3001/quickstart)

This will install the Supaglue Example App in the HubSpot or Salesforce account you've connected, so that your local Supaglue instance can start syncing data. Upon successful login, you will be redirected back to this page.

:::info
To test running queries against Supaglue's API, you'll need the following:

1. A Salesforce or HubSpot app that your customers can connect their CRMs to.
2. A sample "customer" to test with.
3. The sample customer's CRM instance that you'd like to query.

For your convenience in this quickstart, we've provided Supaglue sample apps and two mock customers:

- Salesforce: `9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677`
- HubSpot: `ea3039fa-27de-4535-90d8-db2bab0c0252`

If you don't have a sample CRM instance, you can create a free developer [HubSpot](https://app.hubspot.com/signup-hubspot/crm) or [Salesforce](https://developer.salesforce.com/signup) account.
:::

## 3. Query the Supaglue unified API

After you install the Supaglue sample app in a Salesforce or HubSpot account, Supaglue will start asynchronously syncing Contacts, Leads, Accounts, and Opportunities in the background. This can take a few seconds or minutes depending on the size of the CRM instance.

Make a `GET` request to get a list of accounts:

<Tabs>
<TabItem value="salesforce" label="Salesforce" default>

```shell
curl localhost:8080/crm/v1/accounts \
  -H 'customer-id: 9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677' \
  -H 'provider-name: salesforce'
```

</TabItem>
<TabItem value="hubspot" label="HubSpot">

```shell
curl localhost:8080/crm/v1/accounts \
  -H 'customer-id: ea3039fa-27de-4535-90d8-db2bab0c0252' \
  -H 'provider-name: hubspot'
```

</TabItem>
</Tabs>

Example result:

```console
{
  "results": [
    {
      "id": "4019000e-8743-4603-9a0e-69633289666d",
      "owner": "005Dn000002DY8AIAW",
      "name": "Supaglue",
      "description": "open source unified api",
      "industry": "software",
      "website": "https://supaglue.com",
      "number_of_employees": 6,
      ...
    },
    ...
  ]
}
```

## 4. Check sync status (optional)

If the curl in step 3 did not work, you can curl the `/crm/v1/sync-info` endpoint to check on the status of the syncs.

<Tabs>
<TabItem value="salesforce" label="Salesforce" default>

```shell
curl localhost:8080/crm/v1/sync-info \
  -H 'customer-id: 9ca0cd70-ae74-4f8f-81fd-9dd5d0a41677' \
  -H 'provider-name: salesforce'
```

</TabItem>
<TabItem value="hubspot" label="HubSpot">

```shell
curl localhost:8080/crm/v1/sync-info \
  -H 'customer-id: ea3039fa-27de-4535-90d8-db2bab0c0252' \
  -H 'provider-name: hubspot'
```

</TabItem>
</Tabs>

Example result:

```console
[
  {
    "model_name": "account",
    "last_sync_start": "2023-02-24T07:52:00.076Z",
    "next_sync_start": "2023-02-24T07:53:00.000Z",
    "status": "DONE"
  },
  ...
]
```

## Use your own Salesforce or HubSpot App

Please reach out to us if you'd like to try Supaglue using your Salesforce Connected App or HubSpot App: [support@supaglue.com](mailto:support@supaglue.com).
