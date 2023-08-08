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

## Introduction

An **Entity** is an abstraction that maps to different objects and fields in each of your customer's Providers. As the developer, you define the Entity and its fields. You can then work with a common schema whenever you sync data or perform actions on data.

### Examples

- You'd like to sync `Leads` from Salesforce customers, but `Contacts` from HubSpot customers. You'd like to only sync a subset of fields from each Provider and map them to a common schema, and you'd like to use that schema when creating or updating `Leads` or `Contacts` in your customers' CRMs. You could create a `ContactOrLead` Entity and then map it to `Lead` for Salesforce and `Contact` for HubSpot.
- For one Salesforce customer, you'd like to sync records for the custom object `ProductIdea__c`, but for another customer, you'd like to sync records for the custom object `ProductGap__c`. These two custom objects might even have different field names. However, since these semantically refer to the same concept, so you'd like to write them to your DB as `product_idea` records with the same field names.
- You'd like to create a custom object in each of your customers' HubSpot instances and then create or update records for that object. However, as the custom object id is different per instance, you'd like to use a common Entity to reference these in CRUD operations.

### Comparison

Entities have a 1-N relationship between your application object and Provider objects. As the developer, you define the object-object and field-field relationships between your application and Providers.

Entities differ from [Objects](../objects/overview): Objects only have a 1-1 relationship between your application and Provider objects.

Entities differ from [Common Schema](../common-schema/overview): While Common Schema objects have a 1-N relationship between your application and Provider objects, Supaglue, and not you, determines the mappings.

## Setup

Think about the following questions before you start defining Entities:

1. What do you want to call the Entity?
1. What fields are on the Entity?
1. Do you want to map the Entity to the same Provider's object for all of your customers, or let each customer do it?
1. Do you want to map the Entity's fields to the same Provider's object fields for all of your customers, or let your customers do it?

### Create an Entity

#### Configuration

You can create and update Entities through the Management Portal and Management API.

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

#### Example

The example below defines an Entity named `contact` with two fields: `first_name` and `last_name`, both strings. Customers cannot specify additional fields outside of these two that you, the developer, define.

```json
{
  "name": "contact",
  "config": {
    "fields": [
      {
        "name": "first_name"
      },
      {
        "name": "last_name"
      }
    ],
    "allow_additional_field_mappings": false
  }
}
```

### Entity Mapping

An Entity Mapping defines how you or your customer maps a Provider's object and its fields to your Entity.

It has two main components:

1. A Provider object mapping
1. A Provider object's field mappings

#### Customer-set Entity Mappings

Most of the time, you want to allow your customers to map their Provider objects and fields to your Entities.

You should build a UI to allow your customers to do this mapping. You can use

- the [Custom Objects Metadata API](../../api/v2/metadata/list-custom-objects) to list the Provider's custom objects,
- the [Standard Objects Metadata API](../../api/v2/metadata/list-standard-objects) to list the Provider's standard objects,
- the [Properties Metadata API](../../api/v2/metadata/list-properties) to list the Provider's object fields, and
- the [Entity Mappings Management API](../../api/v2/mgmt/entity-mappings) to view and update the mappings.

##### Example

| Entity              | Customer1 Entity Mapping      | Customer2 Entity Mapping         | Customer3 Entity Mapping   |
| ------------------- | ----------------------------- | -------------------------------- | -------------------------- |
| Name: `contact`     | Salesforce object: `Contact`  | Salesforce object: `Contact__c`  | Hubspot object: `contact`  |
| Field: `first_name` | Salesforce field: `FirstName` | Salesforce field: `FirstName__c` | Hubspot field: `firstname` |
| Field: `last_name`  | Salesforce field: `LastName`  | Salesforce field: `LastName__c`  | Hubspot field: `lastname`  |

The example below is a customer Entity Mapping that maps their Salesforce `Contact` standard object to an Entity `contact` that you, the developer, defines. They mapped their Salesforce's Contact's `FirstName` field to `first_name` and `LastName` field to `last_name`.

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

##### Emulate: Customer Entity Mappings

For development and manual override purposes, you can also view and update these mappings in the Management Portal. Go to **Customers --> Connections --> {ID}** and select the Entity for which you wish to view and optionally save Entity Mappings.

<ThemedImage
  alt="simulate customer entity mappings"
  width="75%"
  sources={{
    light: '/img/simulate-customer-entity-mappings.png',
    dark: '/img/simulate-customer-entity-mappings.png',
  }}
/>

#### Developer-set Entity Mappings

Sometimes, you, the developer, know your Entity's best Provider object and field mappings, and you want them to apply that same default configuration for all of your customers using a particular Provider. In that case, you can set the Entity Mapping yourself. Note that you can still allow your customers can override this mapping.

Use the [Create Provider Management API](../../api/v2/mgmt/create-provider) and [Update Provider Management API](../../api/v2/mgmt/update-provider) to save Entity Mappings for your Entities using the `entity_mappings` field in the request.

##### Example

```json
{
  "entity_mappings": [
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
  ]
}
```

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
postgres=> \d "entity_contact"
                             Table "public.entity_contact"
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

- `contact` is the Entity name and `entity_contact` is the table's auto-generated name in Postgres.
- The shape of `_supaglue_raw_data` corresponds to the fields you defined in your Entity:

```json
{
  "first_name": "Alice",
  "last_name": "Smith"
}
```

If the customer defined additional fields, like `email`, they will also be included in `_supaglue_raw_data` under the `additional_fields` key:

```json
{
  "first_name": "Alice",
  "last_name": "Smith",
  "additional_fields": {
    "email": "alicesmith@gmail.com"
  }
}
```

## Writing

You can write Entities after defining them and their Entity Mappings.

### Configuration

Use the **Configuration --> Provider** page in the Management Portal to map your Entities to Providers. Use the [Action API endpoints](../../api/v2/actions/entity-records) to write to them.

Writing to an Entity Action API endpoint will call the appropriate Provider endpoint based on configured Entity Mappings.

### Example

To create a record for an Entity, use the [Create Entity Record Action API endpoint](../../api/v2/actions/create-entity-record), with a payload like the following:

```json
{
  "data": {
    "first_name": "Alice",
    "last_name": "Doe",
    "email": "alicedoe@gmail.com"
  }
}
```
