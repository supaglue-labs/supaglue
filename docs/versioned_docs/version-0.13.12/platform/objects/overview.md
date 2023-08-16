import ThemedImage from '@theme/ThemedImage';
import BrowserWindow from '@site/src/components/BrowserWindow';

# Standard & Custom Objects

<ThemedImage
alt="standard and custom objects"
width="20%"
sources={{
      light: '/img/object-diagram.png',
      dark: '/img/object-diagram.png',
    }}
/>

## Introduction

**Standard Objects** and **Custom Objects** (known as **Objects**) have a 1-1 relationship between your application object and your Provider object. For example, a `Contact` in Salesforce is a `salesforce_Contact` in your application, and a Hubspot `company` is a `hubspot_company` in your application.

### Comparison

Objects differ from [Common Schema](../common-schema/overview): Common Schemas have a 1-n relationship between your application object and Provider object, where Supaglue determines the normalization.

Objects differ from [Entities](../entities/overview): Entities have a 1-n relationship between your application object and Provider object, where you, the developer, determine the normalization.

## Standard object

Supaglue Standard Objects are pre-defined objects in third-party providers, e.g. `Contacts`, `Accounts`, and `Leads` are pre-defined objects in Salesforce and are Standard Objects in Supaglue.

You can use Standard Objects as part of [Managed Syncs](../../integration-patterns/managed-syncs) and [Actions API](../../integration-patterns/actions-api).

### Syncing

Sync Standard Objects to your Destination using Managed Syncs.

#### Configuration

Use the **Syncs --> Sync Configs** page in the Management Portal to specify the Standard Objects you wish to sync to your Destination.

<BrowserWindow url="https://app.supaglue.io/applications/62605dc1-148e-4c53-a850-82e10f71ed23/syncs/sync_configs/new">

![image](/img/standard-object-sync-config.png)

</BrowserWindow>

The screenshot above shows a Sync Config that specifies `OpportunityLineItem`, `Contract`, and `Quote` Standard Objects. Supaglue will sync these Standard Objects.

Since Standard Objects vary by Provider, you need to select the Standard Objects separately for each Provider. The casing of the Standard Objects is also provider-specific, e.g. Standard Objects for Salesforce are "PascalCase".

#### Destination data schema

Supaglue will land the data in your Destination with the following schema:

```
postgres=> \d "salesforce_Contract"
                             Table "public.salesforce_Contract"
          Column          |              Type              | Collation | Nullable | Default
--------------------------+--------------------------------+-----------+----------+---------
 _supaglue_application_id | text                           |           | not null |
 _supaglue_provider_name  | text                           |           | not null |
 _supaglue_customer_id    | text                           |           | not null |
 _supaglue_emitted_at     | timestamp(3) without time zone |           | not null |
 _supaglue_is_deleted     | boolean                        |           | not null |
 _supaglue_raw_data       | jsonb                          |           | not null |
 id                       | text                           |           | not null |
Indexes:
    "salesforce_Contract_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

### Writing

:::info
The Actions API for Standard Objects is under construction.
:::

Use the Actions API to write [Common Objects](../common-schema/overview) to your customer's third-party Provider.

## Custom object

Custom Objects are objects that are not pre-defined by third-party Providers. You or your customers may create them.

For example, `ContactDailyMetric` and `ContactMonthlyMetric` are the only contact metric Standard Objects in Salesforce, but your customer may have defined a third Custom Object, `ContactBiannualMetric`.

### Syncing

Sync Custom Objects to your Destination using Managed Syncs.

#### Configuration

Use the **Syncs --> Sync Configs** page in the Management Portal to specify the Custom Objects you wish to sync to your Destination.

<BrowserWindow url="https://app.supaglue.io/applications/62605dc1-148e-4c53-a850-82e10f71ed23/syncs/sync_configs/new">

![image](/img/custom-object-sync-config.png)

</BrowserWindow>

The screenshot above shows a Sync Config that specifies `ContactBiannualMetric` and `BattleCard` Custom Objects. Supaglue will sync these Custom Objects.

The casing of Custom Objects is provider-specific.

#### Destination data schema

Supaglue will land the data in your Destination with the following schema:

```
postgres=> \d "salesforce_BattleCard"
                             Table "public.salesforce_BattleCard"
          Column          |              Type              | Collation | Nullable | Default
--------------------------+--------------------------------+-----------+----------+---------
 _supaglue_application_id | text                           |           | not null |
 _supaglue_provider_name  | text                           |           | not null |
 _supaglue_customer_id    | text                           |           | not null |
 _supaglue_emitted_at     | timestamp(3) without time zone |           | not null |
 _supaglue_is_deleted     | boolean                        |           | not null |
 _supaglue_raw_data       | jsonb                          |           | not null |
 id                       | text                           |           | not null |
Indexes:
    "salesforce_BattleCard_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

### Writing

:::info
The Actions API for Custom Objects is under construction.
:::

Use the Actions API to write [Common Objects](../common-schema/overview) to your customer's third-party Provider.

## Schemas

**Schemas** let you normalize fields on your Objects for you, or your customers, to map to Provider objects' fields.

It serves two use cases:

1. It lets you sync a subset of fields and rename them.
2. It lets you normalize fields for a Provider object across customers.

:::tip
**Schemas** allow you to use field mappings on a single Provider object.

Use **[Entities](../entities/overview)** instead to map multiple Provider objects along with field mappings.
:::

### 1. Subset of fields

To sync a subset of fields, first create a Schema. Go to **Data Model --> Schemas**.

Then list out the fields you wish to sync. On the left side, specify the field names written to your Destination. On the right side, map the corresponding fields in your Provider.

<ThemedImage
alt="developer-defined schema"
width="100%"
sources={{
      light: '/img/developer-schema.png',
      dark: '/img/developer-schema.png',
    }}
/>

The JSON for the Schema above looks like the following:

```json
{
  "id": "...",
  "application_id": "...",
  "name": "my_application_contact",
  "config": {
    "fields": [
      {
        "name": "first_name",
        "mapped_name": "FirstName"
      },
      {
        "name": "last_name",
        "mapped_name": "LastName"
      }
    ],
    "allow_additional_field_mappings": false
  }
}
```

Finally, associate the Schema with its corresponding Provider:

- Go to **Connectors --> Providers**.
- Click on the appropriate Provider (Salesforce for example).
- Click "Standard Object" to find the appropriate object in Salesforce (`Contact` for our example).
- Associate it with the Schema that we created above.

<ThemedImage
alt="developer-defined schema"
width="100%"
sources={{
      light: '/img/developer-schema-2.png',
      dark: '/img/developer-schema-2.png',
    }}
/>

### 2. Customer-set field mappings

To normalize fields for a single Provider object across customers, follow the same steps as the "[Subset of fields](#subset-of-fields)" section above, but with one difference: Don't specify the "Mapped Field" when defining your Schema. Instead your customers will do it.

To allow them to do this you will need to build a field mappings UI similar to the one below:

<ThemedImage
alt="salesforce customer-defined field mapping ui"
width="50%"
sources={{
      light: '/img/customer-field-mappings.png',
      dark: '/img/customer-field-mappings.png',
    }}
/>

Use the [`Schema Mappings API`](../../api/v2/mgmt/schema-mappings) to render field mapping UI for your customers and save field mappings set by your customer.

The [List Schema Mappings API](../../api/v2/mgmt/list-field-mappings) will return a JSON similar to the one below:

```js
{
  "object_name": "Contact",
  "object_type": "standard",
  "allow_additional_field_mappings": false,
  "schema_id": "...",
  "fields": [
    {
      "name": "first_name",
      "is_added_by_customer": false,
      "customer_mapped_name": "FirstName" // Customer has mapped the Salesforce "FirstName" field to the Schema field "first_name"
    },
    {
      "name": "last_name",
      "is_added_by_customer": false,
      // Omission of "customer_mapped_name" means they haven't mapped it yet
    },
  ]
}
```

Use the [Update Schema Mappings API](../../api/v2/mgmt/update-object-field-mappings) to save field mappings set by your customer. The shape of the response should look something like the following:

```json
{
  "name": "Contact",
  "type": "standard",
  "field_mappings": [
    {
      "schema_field": "first_name",
      "mapped_field": "FirstName"
    },
    ...
  ]
}
```
