import BrowserWindow from '@site/src/components/BrowserWindow';
import ThemedImage from '@theme/ThemedImage';

# Create custom object schemas, records, and associations

![code](https://img.shields.io/badge/Platform%20Tutorial-0000a5)

This tutorial will show you how to create a custom object schema, write custom object records to that schema, and associate standard objects with your newly created custom object records for Hubspot.

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../quickstart) and will use the following technologies:

- HTTP
- curl
- HubSpot

## Overview

We will use the [CRM Metdata API](../api/v2/crm/unified-crm-api) to create a `UserLocation` (**Custom Object Schema**) and "contact-to-userlocation" relationship (**Association Schema**).

Using the schemas, we'll use the [CRM API](../api/v2/crm/unified-crm-api) to create UserLocations (**Custom Object Records**) and "contact-to-userlocation" relationship (**Association**).

### 1. Define a UserLocation custom object schema

Use the [Create custom object schema API](../api/v2/crm/create-custom-object-schema) to define a UserLocation custom object schema.

```curl
curl --location 'https://api.supaglue.io/crm/v2/metadata/custom_objects' \
--header 'x-customer-id: test' \
--header 'x-provider-name: hubspot' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {YOUR_API_KEY}' \
--data '{
    "object": {
        "name": "UserLocation",
        "description": "The lat/lng of a user",
        "labels": {
            "singular": "UserLocation",
            "plural": "UserLocations"
        },
        "primary_field_id": "name",
        "fields": [
            {
                "label": "Name of the location",
                "id": "name",
                "is_required": true,
                "type": "text"
            },
            {
                "label": "Latitude",
                "id": "lat",
                "is_required": true,
                "type": "text"
            },
            {
                "label": "Longitude",
                "id": "lng",
                "is_required": false,
                "type": "text"
            }
        ]
    }
}'
```

Response:

```json
{
  "object": {
    "name": "UserLocation"
  }
}
```

### 2. Define a "contact-to-userlocation" association schema

Use the [Create association schema API](../api/v2/crm/create-association-schema) to define a "contact-to-userlocation" association schema we can use later.

```curl
curl --location 'https://api.staging.supaglue.io/crm/v2/metadata/associations' \
--header 'x-customer-id: test' \
--header 'x-provider-name: hubspot' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {YOUR_API_KEY}' \
--data '{
    "source_object": "contact",
    "target_object": "UserLocation", // This is case-sensitive
    "suggested_key_name": "contact-to-userlocation",
    "display_name": "User'\''s Location"
}'
```

Response:

```json
{
  "association_schema": {
    "id": "979", // Please keep track of this
    "source_object": "contact",
    "target_object": "2-20447486",
    "display_name": "User's Location"
  }
}
```

### 3. Insert UserLocation custom objects

Use the [Create custom object record API](../api/v2/crm/create-custom-object-record) to create a Location custom object.

```curl
curl --location 'https://api.staging.supaglue.io/crm/v2/custom_objects/UserLocation/records' \
--header 'x-customer-id: test' \
--header 'x-provider-name: hubspot' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {YOUR_API_KEY}' \
--data '{
    "record": {
        "name": "My first location",
        "lat": "37.774929",
        "lng": "-122.419418"
    }
}'
```

:::info

Please note that the custom object name in the URI is case-sensitive and provider-specific.

:::

Response:

```json
{
  "record": {
    "id": "10574312281" // Please keep track of this
  }
}
```

### 4. Associate a Contact with Locations

Use the [Upsert association API](../api/v2/crm/upsert-account) to associate an existing Hubspot Contact with your newly created Location custom objects by their IDs:

```curl
curl --location --request PUT 'https://api.supaglue.io/crm/v2/associations' \
--header 'x-customer-id: test' \
--header 'x-provider-name: hubspot' \
--header 'Content-Type: application/json' \
--header 'x-api-key: {YOUR_API_KEY}' \
--data '{
    "source_record_id": "1",
    "source_object": "contact",
    "target_record_id": "10574312281", // Location record ID from step 3
    "target_object": "UserLocation", // The name of the custom object schema from step 1
    "association_schema_id": "979" // The association schema ID from step 2
}'
```

Response:

```json
{
  "association": {
    "source_record_id": "1",
    "source_object": "contact",
    "target_record_id": "10574312281",
    "target_object": "UserLocation",
    "association_schema_id": "979"
  }
}
```

### Read the contact

Use the [Get Contact API](../api/v2/crm/get-contact) to retrieve the contact object we just associated:

```json
{
    "owner_id": null,
    "account_id": "16821508708",
    "last_modified_at": "2023-11-07T23:41:02.186Z",
    "id": "1",
    "first_name": "Maria",
    "last_name": "Johnson (Sample Contact)",
    ...
    "created_at": "2023-05-31T23:16:02.252Z",
    "updated_at": "2023-11-07T23:41:02.186Z",
    "is_deleted": false,
    "raw_data": {
        ...
        "_associations": {
            "company": [
                "16821508708",
                "17053249412",
                "17233002540",
                "17233007199"
            ],
            "UserLocation": [
                "10574312281"
            ]
        }
    }
}
```

:::note

Populating all associations on reads is only available in Preview to select customers on our Enterprise plan. [Contact us](mailto:team@supaglue.com) for more information.

:::
