import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# Create and write to custom fields

![code](https://img.shields.io/badge/Platform%20Tutorial-0000a5)

This tutorial will go through how create a custom field on a Hubspot Contact object upon your customer connecting their Hubspot instance to your application, and then write to it from your application using the Supaglue API.

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../quickstart) and will use the following technologies:

- HTTP
- curl
- Hubspot

## Create a custom field

Use Supaglue's [Metadata (Create Property) API](https://docs.supaglue.com/api/v2/crm/create-property) to define a custom property on the Hubspot Contact object.

The curl will look like the following:

```curl
curl --location 'https://api.supaglue.io/crm/v2/metadata/properties/contact' \
--header 'x-customer-id: hubspot' \
--header 'x-provider-name: hubspot' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {YOUR_API_KEY}' \
--data '{
    "name": "my_custom_field_1",
    "label": "My Custom Test Field 1",
    "description": "My Custom Test Field 1 Description",
    "is_required": true,
    "type": "text"
}'
```

And return a response that looks like:

```curl
{
    "id": "my_custom_field_1",
    "label": "My Custom Test Field 1",
    "description": "My Custom Test Field 1 Description",
    "type": "text",
    "is_required": true,
    "group_name": "custom_properties",
    "options": [],
    "raw_details": {
        "updated_at": "2023-10-30T23:30:58.133Z",
        "created_at": "2023-10-30T23:30:58.133Z",
        "name": "my_custom_field_1",
        "label": "My Custom Test Field 1",
        "type": "string",
        "field_type": "text",
        "description": "My Custom Test Field 1 Description",
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

Use Supaglue's CRM (Update Contact) API to update a Contact with a value for the custom field we just created above. The curl will look like:

```curl
curl --location --request PATCH 'https://api.supaglue.io/crm/v2/contacts/1' \
--header 'x-customer-id: hubspot' \
--header 'x-provider-name: hubspot' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {YOUR_API_KEY}' \
--data '{
    "record": {
        "custom_fields": {
            "my_custom_test_field_1": "this is my custom field"
        },
        "first_name": "George",
        "last_name": "Xing",
        "addresses": [
            {
                "street_1": "525 Brannan Street",
                "street_2": null,
                "city": "San Francisco",
                "state": "CA",
                "postal_code": "94107",
                "country": "USA",
                "address_type": "mailing"
            },
            {
                "street_1": "525 Brannan Street",
                "street_2": null,
                "city": "San Francisco",
                "state": "CA",
                "postal_code": "94107",
                "country": "USA",
                "address_type": "other"
            }

        ]
    }
}'
```

Now, navigate to your Hubspot Contact and note that the custom property exists on the Contact.
