---
description: ''
sidebar_position: 3
---

import ThemedImage from '@theme/ThemedImage';

# Schemas & field mappings

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

To use the Schema, you need to associate a Provider-object with it. Go to the **Configuration --> Provider** page in the Management Portal or use the [Provider Add Object API](../../api/v2/mgmt/add-object) to configure this.

## Customer-defined field mappings

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

## Developer-defined field mappings

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
