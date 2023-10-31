import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# Create and write to custom fields

![code](https://img.shields.io/badge/Platform%20Tutorial-0000a5)

This tutorial will show you how to create a custom field on a HubSpot Contact object and write to it using the Supaglue API.

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../quickstart) and will use the following technologies:

- HTTP
- curl
- HubSpot

## Create a custom field

Use Supaglue's [Metadata (Create Property) API](https://docs.supaglue.com/api/v2/crm/create-property) to define a custom property on the Hubspot Contact object.

The curl will look like the following:

```shell
curl --location 'https://api.supaglue.io/crm/v2/metadata/properties/contact' \
--header 'x-customer-id: 001' \
--header 'x-provider-name: hubspot' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {YOUR_API_KEY}' \
--data '{
    "name": "total_website_visits_7d",
    "label": "Total Website Visits Last 7 Days",
    "description": "Total number of website visits recorded by MyCompany in the last 7 days",
    "is_required": false,
    "type": "number"
}'
```

And return a response that looks like:

```shell
{
    "id": "total_website_visits_7d",
    "label": "Total Website Visits Last 7 Days",
    "description": "Total number of website visits recorded by MyCompany in the last 7 days",
    "type": "number",
    "is_required": false,
    "options": [],
    "raw_details": {
        "updated_at": "2023-10-30T23:30:58.133Z",
        "created_at": "2023-10-30T23:30:58.133Z",
        "name": "total_website_visits_7d",
        "label": "Total Website Visits Last 7 Days",
        "type": "number",
        "field_type": "number",
        "description": "Total number of website visits recorded by MyCompany in the last 7 days",
        "group_name": "custom_properties",
        "options": [],
        "created_user_id": "49850797",
        "updated_user_id": "49850797",
        "display_order": -1,
        "calculated": false,
        "external_options": false,
        "archived": false,
        "has_unique_value": false,
        "hidden": false,
        "modification_metadata": {
            "archivable": true,
            "read_only_definition": false,
            "read_only_value": false
        },
        "form_field": false
    }
}
```

## Write to the custom field

Use Supaglue's CRM ([Upsert Contact](https://docs.supaglue.com/api/v2/crm/upsert-contact)) API to create or update a Contact with a value for the custom field we just created above. The curl will look like:

```shell
curl -L -X POST 'https://api.supaglue.io/crm/v2/contacts/_upsert' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'x-customer-id: 001' \
-H 'x-provider-name: hubspot' \
-H 'x-api-key: <API_KEY_VALUE>' \
--data-raw '{
  "record": {
    "first_name": "John",
    "last_name": "Doe",
    "custom_fields": {
        "total_website_visits_7d": 52
    }
  },
  "upsert_on": {
    "key": "email",
    "values": [
      "john.doe@example.com"
    ]
  }
}'
```

Now, navigate to your HubSpot Contact to check that the custom field now exists with the value you just added.