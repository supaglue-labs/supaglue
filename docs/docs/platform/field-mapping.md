---
description: ''
---

# Field mapping

Sometimes, your customers may store data in non-standard fields (e.g. custom fields). You can optionally specify a `schema` object in the sync configuration so that each of your customers can map their specific source schema to your product's data model:

```json
...

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
...
```

**Example field mapping UI**:
![field_mapping_ui](/img/field-mapping-ui.png 'salesforce field mapping ui')

In this example, you want to map your customer's `Description` field to `description`, and you also want to map one of your customer's standard field `primary_address` and custom field to `revenue`. Through the [Update Schema endpoint](/api/v2/mgmt#tag/Schemas/operation/updateSchema), each of your customers can then map the appropriate revenue field to your `revenue` field and address to `primary_address`. At runtime, Supaglue will apply each customer's mapping and land the appropriate data into the `revenue` and `primary_address` column in your destination.

The `allow_additional_field_mappings` flag is a way for individual customers to provide optional supplemental data not explicitly required by your schema, but that may be useful for your product. For example, extra attributes for filtering or features for ML models.

You will also need to update the referenced objects using the [Update Provider endpoint](/api/v2/mgmt#tag/Providers/operation/updateProvider) in the Provider.

:::info
We recommend embedding a field mapping UI component in your application that communicates with the Management API to enable a self-serve experience for your customers.
:::
