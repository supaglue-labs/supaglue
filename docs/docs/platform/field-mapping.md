---
description: ''
---

# Field mapping

While one of your customers can be storing their annual revenue in their CRM as `revenue`, another customer could be storing it as `annual_revenue`. If you want your application to use the same consistent name for both fields whenever you interact with Supaglue, read on. Before we get started, here are some concepts you get familiar with:

- Schema: This represents a set of fields that have meaning in your application. You can think of this as your own custom-defined unified schema.
- ObjectToSchemaMapping: This represents a mapping between a Provider Object and a Schema. For example, you could have a single `Schema` defined as `account`, and you'd like to interact with Salesforce `Account` and HubSpot `Company` objects using the fields defined in the `account` Schema.
- FieldMapping: This represents a mapping between one of your customer's fields and your Schema fields.

There are two ways to do this setup:

1. Call an endpoint to create a Schema, then call an endpoint to map an Object to a Schema, and then call an endpoint to map a customer's fields to the Schema fields.
1. Use a convenience endpoint that does this all in one.

We'll walk through the a scenario here using a convenience endpoint.

**Example field mapping UI**:
![field_mapping_ui](/img/field-mapping-ui.png 'salesforce field mapping ui')

In this example, your customer connected Salesforce, and you want to map the following fields from their `Account` object:

- your customer's `Description` field to your application's `description` field,
- your customer's standard field `Address` to your application's `primary_address` field, and
- your customer's custom field `Revenue__c` to your application's `revenue` field.

Construct a request like this to hit the [Add object to provider endpoint](/api/v2/mgmt/add-object),

```json
{
  "type": "standard",
  "name": "Account",
  "enable_sync": true,
  "schema": {
    "fields": [
      {
        "name": "description", // field in your system
        "mapped_name": "Description" // default customer field mapping you define
      },
      {
        "name": "name",
        // omit default customer field mapping for them to map
      },
      {
        "name": "primary_address",
        // omit default customer field mapping for them to map
      }
    ],
    "allow_additional_field_mappings": false
  }
}
```

At runtime, Supaglue will:

- apply each customer's mapping as it lands data into the `revenue` and `primary_address` columns in your destination, and
- apply each customer's mapping as you call Supaglue's APIs to create and update records.

The `allow_additional_field_mappings` flag is a way for individual customers to provide optional supplemental data not explicitly required by your schema but that may be useful for your product. For example, these could be extra attributes for filtering or features for ML models.

:::info
We recommend embedding a field mapping UI component in your application that communicates with the Management API to enable a self-serve experience for your customers.
:::
