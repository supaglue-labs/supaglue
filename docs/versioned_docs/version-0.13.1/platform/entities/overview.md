import ThemedImage from '@theme/ThemedImage';

# Entities

<ThemedImage
alt="common schema"
width="50%"
sources={{
      light: '/img/entity-diagram.png',
      dark: '/img/entity-diagram.png',
    }}
/>

**Entities** are objects in your application that you, as a developer, define and want to be normalized across all your Providers.

Entities have a 1-n relationship between your application object and Provider object. As the developer, you define the object-object and field-field relationships between your application and Providers.

Entities differ from [Objects](../objects/overview): Objects only have a 1-1 relationship between your application and Provider objects.

Entities differ from [Common Schema](../common-schema/overview): While Common Schema objects have a 1-n relationship between your application and Provider objects, Supaglue, and not you, determines the normalization.

## Entity

When using Entities, you must define them. There must be corresponding Entity Mappings before you can sync or write to them. You will need to answer these questions to define your Entity:

1. What do you want to call it?
2. What fields are on the Entity?
3. Do you want to map the Provider object or let your customers do it?
4. Do you want to map a Provider's object's fields or let your customers do it?

### Configuration

You can create/update Entities through the Management Portal and Management API.

Use the **Configuration --> Entities** page in the Management Portal to define Entities.

<ThemedImage
alt="entity sync config"
width="80%"
sources={{
      light: '/img/entity-config.png',
      dark: '/img/entity-config.png',
    }}
/>

You can also define Entities programmatically using the [Entities Management API](../../api/v2/mgmt/entities).

### Example

The example below defines an Entity named `contact` with two fields:`first_name` and `last_name`, both strings. Customers cannot specify additional fields outside of these two that you, the developer, defined.

```
{
  "name": "contact",
  "config": {
    "fields": [
      {
        "first_name": "string"
      },
      {
        "last_name": "string"
      }
    ],
    "allow_additional_field_mappings": false
  }
}
```

## Entity Mapping

An Entity Mapping defines how you or your customer maps a Provider's object and its fields to your Entity.

It has two main components:

1. A Provider object mapping
2. A Provider object's field mappings

### Customer-set Entity Mappings

Most of the time, you want to allow your customers to map their Provider objects and fields to your Entities.

Use the [Entity Mappings Management API](../../api/v2/mgmt/entity-mappings) to render Entity Mappings for your customers and to let them save them.

### Example

| Entity              | Customer1 Entity Mapping      | Customer2 Entity Mapping         | Customer3 Entity Mapping   |
| ------------------- | ----------------------------- | -------------------------------- | -------------------------- |
| Name: `contact`     | Salesforce object: `Contact`  | Salesforce object: `Contact__c`  | Hubspot object: `contact`  |
| Field: `first_name` | Salesforce field: `FirstName` | Salesforce field: `FirstName__c` | Hubspot field: `firstname` |
| Field: `last_name`  | Salesforce field: `LastName`  | Salesforce field: `LastName__c`  | Hubspot field: `lastname`  |

The example below is a customer Entity Mapping that maps their Salesforce `Contact` standard object on an Entity `contact` that you, the developer, defined. They mapped their Salesforce's Contact's `FirstName` to `first_name` and `LastName` to `last_name` fields.

```json
{
  "entity_id": "contact",
  "object": {
    "type": "standard",
    "name": "Contact"
  },
  "field_mappings": [
    {
      "entity_field": "first_name",
      "mapped_field": "FirstName"
    },
    {
      "entity_field": "last_name",
      "mapped_field": "LastName"
    }
  ]
}
```

### Emulate: Customer Entity Mappings

Use the Management Portal to view and save Entity Mappings for your customers. Go to **Customers --> Connections --> {ID}** and select the Entity you wish to view and optionally save.

<ThemedImage
alt="simulate customer entity mappings"
width="75%"
sources={{
      light: '/img/simulate-customer-entity-mappings.png',
      dark: '/img/simulate-customer-entity-mappings.png',
    }}
/>

### Developer-set Entity Mappings

Sometimes, you, the developer, know your Entity's best Provider object and field mappings. In that case, you can set the Entity Mapping yourself.

Use the [Create Provider Management API](../../api/v2/mgmt/create-provider) and [Update Provider Management API](../../api/v2/mgmt/update-provider) to save Entity Mappings for your Entities using the `entity_mappings` field in the request.

#### Example configuration json

:::info
This is under construction.
:::

## Syncing

You can sync Entities after defining them and their Entity Mappings.

### Configuration

Use the **Configuration --> Sync Configs** page in the Management Portal to specify the Entities to sync to your Destination.

<ThemedImage
alt="entity sync config"
width="80%"
sources={{
      light: '/img/entity-sync-config.png',
      dark: '/img/entity-sync-config.png',
    }}
/>

### Destination data schema

Supaglue will land the data in your Destination with the schema below using the example from above.

```
postgres=> \d "contact"
                             Table "public.contact"
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
    "salesforce_contact_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

A few things to note:

- `contact` is the Entity name and the table's name in Postgres.
- The shape of `_supaglue_raw_data` corresponds to the fields you defined in your Entity.

```

_supaglue_raw_data:
  first_name
  last_name

```

## Writing

You can write Entities after defining them and their Entity Mappings.

### Configuration

Use the **Configuration --> Provider** page in the Management Portal to map your Entities to Providers. Use the Action API endpoints to write to them:

`/actions/v2/entities/:entity_id`

Writing to an Entity Action API endpoint will call the appropriate Provider endpoint based on configured Entity Mappings.

### Example

:::info
This is under construction.
:::
