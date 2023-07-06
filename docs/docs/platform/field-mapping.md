---
description: ''
---

# Field mapping

While one of your customers can be storing their annual revenue in `revenue`, another customer could be storing it in `annual_revenue`. If you want your application to only need to reference the same name for both fields, you can optionally specify a `schema` object in the sync configuration:

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

Each of your customers can then map their specific source data model to your product's schema.

**Example field mapping UI**:
![field_mapping_ui](/img/field-mapping-ui.png 'salesforce field mapping ui')

In this example, you want to map:

- your customer's `Description` field to `description`,
- your customer's standard field `primary_address` to `primary_address`, and
- your customer's custom field `revenue` to `revenue`.

Through the [Update Connection endpoint](/api/v2/mgmt/update-connection), by setting the `schema_mappings_config` key, each of your customers can then map the appropriate revenue field to your `revenue` field and address to `primary_address`. At runtime, Supaglue will:

- apply each customer's mapping as it lands data into the `revenue` and `primary_address` columns in your destination, and
- apply each customer's mapping as you call Supaglue's APIs to create and update records.

The `allow_additional_field_mappings` flag is a way for individual customers to provide optional supplemental data not explicitly required by your schema but that may be useful for your product. For example, extra attributes for filtering or features for ML models.

You will also need to update the referenced objects using the [Update Provider endpoint](/api/v2/mgmt/update-provider) in the Provider.

:::info
We recommend embedding a field mapping UI component in your application that communicates with the Management API to enable a self-serve experience for your customers.
:::
