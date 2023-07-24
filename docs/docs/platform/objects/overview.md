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

**Standard Objects** and **Custom Objects** (known as **Objects**) have a 1-1 relationship between your application object and your Provider object. For example, a `Contact` in Salesforce is a `salesforce_Contact` in your application, and a Hubspot `company` is a `hubspot_company` in your application.

Objects differ from [Common Schema](../common-schema/overview): Common Schemas have a 1-n relationship between your application object and Provider object, where Supaglue determines the normalization.

Objects differ from [Entities](../entities/overview): Entities have a 1-n relationship between your application object and Provider object, where you, the developer, determine the normalization.

## Standard object

Supaglue Standard Objects are pre-defined objects in third-party providers, e.g. Contacts, Accounts, and Leads are pre-defined objects in Salesforce and are Standard Objects in Supaglue.

You can use Standard Objects as part of [Managed Syncs](../../integration-patterns/managed-syncs) and [Actions API](../../integration-patterns/actions-api).

### Syncing

Sync Standard Objects to your Destination using Managed Syncs.

#### Configuration

Use the **Configuration --> Sync Configs** page in the Management Portal to specify the Standard Objects you wish to sync to your Destination.

<BrowserWindow url="https://app.supaglue.io/applications/62605dc1-148e-4c53-a850-82e10f71ed23/configuration/providers/crm/salesforce">

![image](/img/standard-object-sync-config.png)

</BrowserWindow>

The screenshot above shows a Sync Config that specifies `OpportunityLineItem`, `Contract`, and `Quote` Standard Objects. Supaglue will sync these Standard Objects.

Since Standard Objects vary by Provider, you need to select the Standard Objects separately for each Provider. The casing of the Standard Objects is also provider-specific, e.g. Standard Objects for Salesforce are "PascalCase".

#### Data schema

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

Use the **Configuration --> Sync Configs** page in the Management Portal to specify the Custom Objects you wish to sync to your Destination.

<BrowserWindow url="https://app.supaglue.io/applications/62605dc1-148e-4c53-a850-82e10f71ed23/configuration/providers/crm/salesforce">

![image](/img/custom-object-sync-config.png)

</BrowserWindow>

The screenshot above shows a Sync Config that specifies `ContactBiannualMetric` and `BattleCard` Custom Objects. Supaglue will sync these Custom Objects.

The casing of Custom Objects is provider-specific.

#### Data schema

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

Supaglue's unified Custom Objects Actions API allows you to:

- Create custom objects
- Create custom object records
- Create association types between objects
- Create associations between records

#### Example

Suppose you want to store information about competitors relevant to a particular Salesforce Opportunity. You could use Supaglue's Custom Objects API to do the following:

1. Create a custom object called `CompetitorInfo`.
1. Create an association type between `Opportunity` and `CompetitorInfo`.
1. When you create a new `Opportunity` record, find an existing `CompetitorInfo` record (or create a new one) and associate it with the `Opportunity` record.

# Field mapping

Using a Schema, unify Standard Objects, as well as their fields, between third-party Providers. You can apply field mappings to the Schema or have your customers set them.

## Schemas

You, the developer, define schemas.

### Configuring Schemas

The shape of a Schema looks like the following:

```json
{
  "id": "...",
  "application_id": "...",
  "name": "account",
  "config": {
    "fields": [
      {
        "name": "name"
      },
      {
        "name": "industry"
      },
      {
        "name": "description"
      },
      {
        "name": "website"
      }
    ],
    "allow_additional_field_mappings": false
  }
}
```

The example above defines an `account` object in your application with the fields `name`, `industry`, `description`, and `website` to which you or your customer can choose to map third-party Provider fields.

The `allow_additional_field_mappings` flag allows individual customers to provide optional supplemental data not explicitly required by your schema, which may be helpful for your product.

You can use the Management Portal or Schemas API to create, update, and delete Schemas.

### Using Schemas

:::info
This is under construction.
:::

To use the Schema, you need to associate a Provider-object with it. Go to the **Configuration --> Provider** page in the Management Portal or use the Add Object API to configure this.

## Customer-defined field mapping

Use the [`Field Mappings API`](../../api/v2/mgmt/field-mappings) to render field mapping UI for your customers and save field mappings set by your customer.

When a Schema exists, is associated with a Provider-object, and has field mappings defined, Supaglue will:

- Apply the field mapping for Managed Syncs.
- Use the reverse of the field mapping when making Actions API calls.

### Example

<ThemedImage
alt="salesforce customer-defined field mapping ui"
width="50%"
sources={{
      light: '/img/customer-field-mappings.png',
      dark: '/img/customer-field-mappings.png',
    }}
/>

The screenshot above shows a field mapping UI for a `contact` Standard Object. It has an associated Schema with the following fields: `first_name`, `last_name`, `phone`, `address`. The UI uses the [List Field Mappings API](../../api/v2/mgmt/list-field-mappings) to fetch information to render it. The endpoint returns a response like the one below:

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

      // Customer has mapped the Salesforce "FirstName" field to the Schema field "first_name"
      "customer_mapped_name": "FirstName"
    },
    ...
  ]
}
```

Use the [Update Object Field Mappings API](../../api/v2/mgmt/update-object-field-mappings) to save field mappings set by your customer. The shape of the response should look something like the following:

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

## Developer-defined field mapping

:::info
Developer-defined field mapping is under construction.
:::

### Example

<ThemedImage
alt="salesforce developer-defined field mapping ui"
width="50%"
sources={{
      light: '/img/developer-field-mappings.png',
      dark: '/img/developer-field-mappings.png',
    }}
/>
