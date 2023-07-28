import ThemedImage from '@theme/ThemedImage';

# Unify your customers' objects across Providers with Entities

![platform](https://img.shields.io/badge/Platform%20Tutorial-009be5)

This tutorial will go through how to normalize your application's data models across your customers and different Providers. In this example, we will define a "contact" data model in a sample application called Apolla.io and unify it across two CRMs, Salesforce and Hubspot.

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../quickstart) and will use the following technologies:

- Postgres
- Hubspot
- Salesforce

## Define your application's "contact" data model

<ThemedImage
alt="entity tutorial diagram"
width="50%"
sources={{
    light: '/img/entity-tutorial-diagram.png',
    dark: '/img/entity-tutorial-diagram.png',
  }}
/>

Your application data models are called [Entities](../platform/entities/overview) in Supaglue.

Let's call our "contact" Entity, `apolla_contact`, and we want three fields on it: `first_name`, `last_name`, and `address`.

Navigate to **Configuration --> Entities** to define it in the Management Portal. Enter the "Name" and "Fields" as shown below.

<ThemedImage
alt="entity tutorial configuration"
width="100%"
sources={{
    light: '/img/entity-tutorial-configuration.png',
    dark: '/img/entity-tutorial-configuration.png',
  }}
/>

## Associate the Entity for syncs

To use the Entity for [Managed Syncs](../integration-patterns/managed-syncs), navigate to **Configuration --> Sync Configs**, where you should have already defined one for Hubspot and Salesforce.

<ThemedImage
alt="entity tutorial sync config"
width="100%"
sources={{
    light: '/img/entity-tutorial-sync-config.png',
    dark: '/img/entity-tutorial-sync-config.png',
  }}
/>

Click on each, and under the "Entities" section, select `apolla_contact`.

<ThemedImage
alt="entity tutorial sync config"
width="100%"
sources={{
    light: '/img/entity-tutorial-sync-config-details.png',
    dark: '/img/entity-tutorial-sync-config-details.png',
  }}
/>

## Save customer mappings

Now that your data model is defined, customers must map their CRM's contact object and fields, what Supaglue calls [Entity Mapping](../platform/entities/overview#entity-mapping), to your `apolla_contact`.

In the [Build field mapping UI](./build-field-mapping-ui) tutorial, we will go through how to build a field mapping UI for your customers. This tutorial will use a customer field mapping emulator built into the Management Portal.

Navigate to **Customers --> {Connections} --> {ID}**. This field mapping screen simulates as if you were a customer.

<ThemedImage
alt="entity tutorial entity mapping emulator"
width="100%"
sources={{
    light: '/img/entity-tutorial-entity-mapping-emulator.png',
    dark: '/img/entity-tutorial-entity-mapping-emulator.png',
  }}
/>

:::info
If there is no Provider logo to click on on the Customers page, you will need to follow the step in the [Quickstart](../quickstart#7-create-a-connection) to create a connection.
:::

For Hubspot, select a Hubspot standard object, then proceed to map corresponding fields for `first_name`, `last_name`, and `address`.

<ThemedImage
alt="entity tutorial entity mapping emulator"
width="100%"
sources={{
    light: '/img/entity-tutorial-entity-mapping-emulator-2.png',
    dark: '/img/entity-tutorial-entity-mapping-emulator-2.png',
  }}
/>

## Save a Salesforce customer's Entity Mappings

Follow the steps above again, but with a Salesforce account, so you have two connected customers using different CRMs.

## Backfilling data

Since we had a Connection before saving the customer [Entity Mapping](../platform/entities/overview#entity-mapping), previously synced records may not have the Entity Mapping applied.

Supaglue's Management API provides a [Sync API](../api/v2/mgmt/trigger-sync) to trigger full syncs to backfill data.

You can also use the Management Portal for your convenience by navigating to **Sync** tab, finding the `apolla_contact` Sync, and clicking "Trigger Full".

<ThemedImage
alt="entity tutorial entity mapping emulator"
width="100%"
sources={{
    light: '/img/entity-tutorial-trigger-sync.png',
    dark: '/img/entity-tutorial-trigger-sync.png',
  }}
/>

## Query `apolla_contact` in your Destination

Login to your configured Destination (here, we will use Postgres) and inspect the `apolla_contact` table.

Hubspot:

```sql
postgres=> select * from crm_contacts where _supaglue_provider_name = 'hubspot' limit 1;
-[ RECORD 1 ]------------+--------------------------------------------------------------------------------------------------------------------------------------------
_supaglue_application_id | 4d9971de-773c-482c-b0a9-7545667dab46
_supaglue_provider_name  | hubspot
_supaglue_customer_id    | john-doe
_supaglue_raw_data       | {...}
_supaglue_mapped_data    | {"first_name": "Joe", "last_name": "Locke", "address": "4 Windmill St."}
id                       | 1
...
```

Salesforce:

```sql
postgres=> select * from crm_contacts where _supaglue_provider_name = 'salesforce' limit 1;
-[ RECORD 1 ]------------+-----------------------------------------------------------------------
_supaglue_application_id | 4d9971de-773c-482c-b0a9-7545667dab46
_supaglue_provider_name  | salesforce
_supaglue_customer_id    | jane-doe
_supaglue_mapped_data    | {"first_name": "Joe", "last_name": "Locke", "address": "4 Windmill St. London, W1T 2HZ, England"}
_supaglue_raw_data       | {...}
id                       | 003Hu00003QJ2YxIAL
...
```

Take note of the `_supaglue_mapped_data` column and that the keys of its JSONB column reflect the fields you defined on your `apolla_contact` Entity.

Also, note that the JSONB values reflect the fields mapped by the customer: in this tutorial, Street Address (`address`) for Hubspot and `MailingAddress` for Salesforce.
