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

Entities differ from [Common Schema](../common-schema/overview): While Common Schema objects have a 1-n relationship between your application and Provider objects, Supaglue determines the normalization.

## Entity

When using Entities, you must define them. There must be corresponding Entity Mappings before you can sync or write to them. You will need to answer these questions to define your Entity:

1. What do you want to call it?
2. Do you want to map the Provider object or let your customers do it?
3. What fields are on the Entity?
4. Do you want to map a Provider's object's fields or let your customers do it?

### Configuration

You can create/update Entities through the Management Portal and Management API.

Use the **Configuration --> Entities** page in the Management Portal to define Entities.

:::info
Screenshot...
:::

You can also define Entities programmatically using the [Entities Management API](../../api/v2/mgmt/entities).

#### Configuration json

:::info
Json example...
:::

## Entity Mapping

An Entity Mapping is how you or your customer maps a Provider's object to your Entity.

### Developer-set Entity Mappings

Use the [Create Provider Management API](../../api/v2/mgmt/create-provider) and [Update Provider Management API](../../api/v2/mgmt/update-provider) to save Entity Mappings for your Entities using the `entity_mappings` field in the request.

#### Example

:::info
Json example...
:::

### Customer-set Entity Mappings

Use the [Entity Mappings Management API](../../api/v2/mgmt/entity-mappings) to save Entity Mappings that your customers set.

Also, use these APIs to render the Entity and Entity Mappings for your customers.

Here's a screenshot of an example implementation:

<ThemedImage
alt="common schema"
width="50%"
sources={{
      light: '/img/customer-field-mappings.png',
      dark: '/img/customer-field-mappings.png',
    }}
/>

#### Example

:::info
Json example...
:::

## Example

| Entity              | Customer1 mapping             | Customer2 mapping                | Customer3 mapping          |
| ------------------- | ----------------------------- | -------------------------------- | -------------------------- |
| Name: `contact`     | Salesforce object: `Contact`  | Salesforce object: `Contact__c`  | Hubspot object: `contact`  |
| Field: `first_name` | Salesforce field: `FirstName` | Salesforce field: `FirstName__c` | Hubspot field: `firstname` |
| Field: `last_name`  | Salesforce field: `LastName`  | Salesforce field: `LastName__c`  | Hubspot field: `lastname`  |

## Syncing

You can sync Entities after defining them.

### Configuration

Use the **Configuration --> Sync Configs** page in the Management Portal to specify the Entities to sync to your Destination.

:::info
Screenshot...
:::

### Data schema

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
    "contact_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
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

You can write Entities after defining them

### Configuration

Use the **Configuration --> Provider** page in the Management Portal to map your Entities to Providers. Use the Action API endpoints to write to them:

`/actions/v2/entities/:entity_id`

Writing to an Entity Action API endpoint will call the appropriate Provider endpoint based on configured Entity Mappings.

### Example

:::info
This is under construction.
:::
